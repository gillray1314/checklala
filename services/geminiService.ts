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
    const prompt = `
      You are an autocomplete engine for a video game price tracker.
      User input: "${partialQuery}"
      
      Task: Return a JSON Array of 5 most likely specific video game titles or console names the user is looking for.
      - Keep them concise.
      - If the input implies a specific region (e.g. "jp", "asia"), include that context.
      
      Example Input: "poke"
      Example Output: ["Pokemon Red", "Pokemon Emerald", "Pokemon SoulSilver", "Pokemon Switch Console"]

      OUTPUT: Raw JSON Array of strings only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    const prompt = `
      Analyze the item/game: "${query}".
      
      Tasks:
      1. Brief description & category.
      2. Estimate value in ${currency}.
      3. 3 Search keywords.
      4. LANGUAGE & VERSION CHECK (Crucial):
         Find supported languages (Audio/Text) for these 3 specific versions. 
         Focus on whether they support Chinese or English.
         
         - Japan Version (JP): Search on nintendo.co.jp or playstation.com/ja-jp
         - USA/Global Version (US): Search on nintendo.com or playstation.com
         - Asia Version (ASI): Search on nintendo.com.hk, playstation.com/en-hk, or play-asia.com
      
      OUTPUT FORMAT (Raw JSON only):
      {
        "name": "Product Name",
        "category": "Category",
        "description": "Description...",
        "estimatedValue": "${currency} XX - ${currency} XX",
        "searchTips": ["Keyword1", "Keyword2", "Keyword3"],
        "versions": [
          { 
            "region": "JP", 
            "languages": "Japanese Only (or Japanese, English if supported)", 
            "sourceUrl": "URL found for JP version" 
          },
          { 
            "region": "US", 
            "languages": "English, French, Spanish...", 
            "sourceUrl": "URL found for US version" 
          },
          { 
            "region": "ASIA", 
            "languages": "Traditional Chinese, English...", 
            "sourceUrl": "URL found for Asia version" 
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    const prompt = `
      Find current market prices for "${query}" on these platforms: 
      1. PriceCharting
      2. eBay
      3. Shopee Malaysia
      4. CeX (Webuy) Malaysia
      
      Instructions:
      - CONVERT ALL PRICES to ${currency}.
      - Return a structured list of prices found.
      - If a platform has no data/listings, set status to "Not found".
      - Provide a very brief overview text summarizing the market status.

      OUTPUT FORMAT:
      Return ONLY a raw JSON string (no markdown) with this structure:
      {
        "prices": [
          { "platform": "PriceCharting", "price": "${currency} 50", "status": "Available" },
          { "platform": "eBay", "price": "${currency} 45 - 60", "status": "Many listings" },
          { "platform": "Shopee", "price": "Not found", "status": "Out of stock" }
        ],
        "overview": "Brief summary of pricing trends..."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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