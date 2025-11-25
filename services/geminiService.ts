import { GoogleGenAI } from "@google/genai";
import { ItemAnalysis, PriceInsight, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeItemWithGemini = async (query: string, currency: string): Promise<ItemAnalysis | null> => {
  try {
    // We must use googleSearch to find accurate language info from official sites.
    // NOTE: When tools (googleSearch) are used, responseMimeType: 'application/json' is NOT supported by the SDK/API in the same way.
    // We must ask for a plain string JSON and parse it manually.
    const prompt = `
      Analyze the item/product named: "${query}".
      
      Tasks:
      1. Provide a brief description and identify its category.
      2. Estimate a rough global value range in ${currency} for a used condition (e.g. "MYR 100 - MYR 200").
      3. Provide 3 specific search keywords.
      4. LANGUAGE CHECK: Use Google Search to find the supported text/audio languages for this game/product. 
         - PRIORITIZE searching on "nintendo.co.jp" or "playstation.com/ja-jp" or official developer sites.
         - List the languages clearly (e.g., "Japanese, English, Chinese").
      
      OUTPUT FORMAT:
      Return ONLY a raw JSON string (no markdown formatting like \`\`\`json) with the following structure:
      {
        "name": "Product Name",
        "category": "Category",
        "description": "Description...",
        "estimatedValue": "${currency} XX - ${currency} XX",
        "searchTips": ["Keyword1", "Keyword2", "Keyword3"],
        "languages": "Japanese, English..."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be used with tools for now in this context without conflicts, 
        // so we rely on the prompt to enforce JSON structure.
      }
    });

    const text = response.text || "{}";
    
    // Clean up potential markdown code blocks if the model includes them
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data: ItemAnalysis;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      console.warn("Failed to parse JSON directly, attempting fallback", e);
      return null;
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the current market price for "${query}" on these specific platforms: 
      1. PriceCharting
      2. eBay
      3. Shopee Malaysia
      4. CeX (Webuy) Malaysia
      
      Instructions:
      - Summarize the findings in a concise list.
      - CONVERT ALL PRICES to ${currency} (approximate exchange rate is fine).
      - If a specific platform has no recent data or the item isn't found there, explicitly state "Not found".
      - Keep it brief and focused on price numbers.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    // Extract grounding chunks (sources)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

    return {
      text: response.text || "No pricing data found.",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini price search failed:", error);
    return {
      text: "Could not fetch live prices at this time.",
      sources: []
    };
  }
};