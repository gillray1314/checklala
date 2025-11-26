import { GoogleGenAI } from "@google/genai";
import { ItemAnalysis, PriceInsight, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from mixed text
function extractJSON(text: string): any {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try cleaning markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanText);
    } catch (e2) {
      // 3. Regex search for the first valid JSON object structure
      const match = cleanText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e3) {
          console.warn("Regex found potential JSON but parse failed", e3);
        }
      }
      // 4. Regex search for array structure (for autocomplete)
      const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
         try {
            return JSON.parse(arrayMatch[0]);
         } catch (e4) {}
      }
    }
    throw new Error("Could not parse JSON response");
  }
}

export const getAutocompleteSuggestions = async (partialQuery: string): Promise<string[]> => {
  if (!partialQuery || partialQuery.length < 2) return [];

  try {
    // Keep Flash-Lite for Autocomplete (Needs speed, low complexity)
    const prompt = `
      Task: Autocomplete video game titles.
      Input: "${partialQuery}"
      Output: JSON Array of 5 strings. No markdown.
      
      Example: "poke" -> ["Pokemon Red", "Pokemon Emerald", "Pokemon Switch", "Pokemon Cards", "Pokemon Plush"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: prompt,
    });

    const text = response.text || "[]";
    const json = extractJSON(text);
    return Array.isArray(json) ? json.slice(0, 5) : [];
  } catch (error) {
    // Fail silently for autocomplete to avoid disrupting UX
    return [];
  }
};

export const analyzeItemWithGemini = async (query: string, currency: string): Promise<ItemAnalysis | null> => {
  try {
    // UPGRADE: Use Gemini 3 Pro Preview for maximum reasoning capabilities on complex text tasks
    const prompt = `
      Analyze item: "${query}".
      Tasks:
      1. Identify exact Name, Category, and a short Description.
      2. Estimate Market Value in ${currency} strictly based on search results.
      3. Generate 3 smart Search Keywords.
      4. Research Language Support for JP, US, and ASIA versions.
      
      CRITICAL - SOURCE OF TRUTH:
      - You MUST use the 'googleSearch' tool.
      - For Language Support, ONLY trust official sources: nintendo.co.jp, playstation.com, nintendo.com.hk.
      - Do NOT use wikis or reddit.
      - "sourceUrl" MUST be the direct link to the specific game/product page found in search.
      
      Output JSON ONLY. No markdown.
      {
        "name": "Full Exact Name",
        "category": "Console/Game/Accessory",
        "description": "Short accurate description (max 20 words).",
        "estimatedValue": "${currency} XX",
        "searchTips": ["Tag1", "Tag2"],
        "versions": [
          { "region": "JP", "languages": "Supported Languages", "sourceUrl": "https://www.nintendo.co.jp/..." },
          { "region": "US", "languages": "Supported Languages", "sourceUrl": "https://www.nintendo.com/..." },
          { "region": "ASIA", "languages": "Supported Languages", "sourceUrl": "https://..." }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Changed from 2.5-flash to 3-pro for better accuracy
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "{}";
    
    let data: ItemAnalysis;
    try {
      data = extractJSON(text);
    } catch (e) {
      console.warn("JSON extraction failed:", e);
      return {
        name: query,
        category: "Unknown",
        description: "Could not analyze details automatically.",
        estimatedValue: "N/A",
        searchTips: [query],
        versions: []
      };
    }

    // Extract grounding chunks (sources) for the analysis
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

    return {
      ...data,
      sources: sources
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const searchItemPrices = async (query: string, currency: string): Promise<PriceInsight | null> => {
  try {
    // UPGRADE: Use Gemini 3 Pro Preview for pricing.
    // It is much better at reading search snippets and avoiding hallucination.
    const prompt = `
      Task: Find REAL-TIME market prices for "${query}" in ${currency}.
      
      Strict Rules:
      1. USE Google Search. 
      2. If the search result does not explicitly show a price for this item, DO NOT INVENT ONE.
      3. If no price is found for a platform, set status to "Check Website" and price to "---".
      4. Do not estimate conversions unless the search result provides them.
      
      Targets:
      1. PriceCharting (Look for 'loose', 'cib', or 'new' price).
      2. eBay (Look for 'buy it now' or recent sold).
      3. Shopee Malaysia (Look for actual listing prices).
      4. CeX / Webuy Malaysia (Look for 'WeSell' price).

      Output JSON ONLY. No markdown.
      {
        "prices": [
          { "platform": "PriceCharting", "price": "${currency} XX", "status": "Market Price" },
          { "platform": "eBay", "price": "${currency} XX", "status": "Avg Listed" },
          { "platform": "Shopee Malaysia", "price": "${currency} XX", "status": "Low-High" },
          { "platform": "CeX / Webuy MY", "price": "${currency} XX", "status": "WeSell Price" }
        ],
        "overview": "One sentence factual summary. If data is missing, say so."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Changed from 2.5-flash to 3-pro for better accuracy
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "{}";
    let data;
    
    try {
      data = extractJSON(text);
    } catch (e) {
      console.warn("Price search JSON parsing failed", e);
      data = {
        prices: [],
        overview: response.text || "Could not parse price data."
      };
    }

    // Extract grounding chunks (sources)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

    return {
      prices: data.prices || [],
      overview: data.overview || "No details available.",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini price search failed:", error);
    return {
      prices: [],
      overview: "Could not fetch live prices. Please check your API Key or network connection.",
      sources: []
    };
  }
};