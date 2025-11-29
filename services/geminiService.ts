import { GoogleGenAI, Type } from "@google/genai";
import { GraphData, NodeType } from "../types";

// Base64 Encoded Fsociety Mask Fallback (Dark/Red Theme)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' style='background-color: %230a0a0a'%3E%3Cpath fill='%23333' d='M50 10c-25 0-40 15-40 35 0 25 10 45 40 45s40-20 40-45c0-20-15-35-40-35zm-12 25c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm24 0c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm-12 40c-10 0-15-5-18-10h36c-3 5-8 10-18 10z'/%3E%3C/svg%3E";

// Official Fandom Wiki Character Portraits (Proxied via wsrv.nl to bypass hotlink protection)
const WIKI_IMAGES: Record<string, string> = {
  "Elliot Alderson": "https://static.wikia.nocookie.net/mrrobot/images/1/13/Elliot_Alderson_S4.jpg",
  "Mr. Robot": "https://static.wikia.nocookie.net/mrrobot/images/8/83/Mr._Robot_S4.jpg",
  "Darlene Alderson": "https://static.wikia.nocookie.net/mrrobot/images/2/25/Darlene_Alderson_S4.jpg",
  "Angela Moss": "https://static.wikia.nocookie.net/mrrobot/images/7/78/Angela_Moss_S3.jpg",
  "Tyrell Wellick": "https://static.wikia.nocookie.net/mrrobot/images/f/f3/Tyrell_Wellick_S4.jpg",
  "Whiterose": "https://static.wikia.nocookie.net/mrrobot/images/5/59/Whiterose_S4.jpg",
  "Phillip Price": "https://static.wikia.nocookie.net/mrrobot/images/c/c9/Phillip_Price_S4.jpg",
  "Dominique DiPierro": "https://static.wikia.nocookie.net/mrrobot/images/a/a2/Dom_DiPierro_S4.jpg",
  "Dom DiPierro": "https://static.wikia.nocookie.net/mrrobot/images/a/a2/Dom_DiPierro_S4.jpg",
  "Irving": "https://static.wikia.nocookie.net/mrrobot/images/e/e6/Irving_S3.jpg",
  "Leon": "https://static.wikia.nocookie.net/mrrobot/images/0/0d/Leon_S4.jpg",
  "Fernando Vera": "https://static.wikia.nocookie.net/mrrobot/images/c/c3/Fernando_Vera_S4.jpg",
  "Janice": "https://static.wikia.nocookie.net/mrrobot/images/0/02/Janice.jpg",
  "Krista Gordon": "https://static.wikia.nocookie.net/mrrobot/images/1/1d/Krista_Gordon_S4.jpg",
  "Gideon Goddard": "https://static.wikia.nocookie.net/mrrobot/images/3/30/Gideon_Goddard.jpg",
  "Shayla Nico": "https://static.wikia.nocookie.net/mrrobot/images/8/88/Shayla_Nico.jpg",
  "Trenton": "https://static.wikia.nocookie.net/mrrobot/images/5/5f/Trenton.jpg",
  "Mobley": "https://static.wikia.nocookie.net/mrrobot/images/6/64/Mobley.jpg",
  "Romero": "https://static.wikia.nocookie.net/mrrobot/images/e/e2/Romero.jpg",
  "Joanna Wellick": "https://static.wikia.nocookie.net/mrrobot/images/4/4c/Joanna_Wellick_S2.jpg"
};

const getProxiedUrl = (url: string) => {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover&output=jpg`;
};

const SYSTEM_INSTRUCTION = `
You are a database architect for fsociety. Your task is to map the relationships of the TV show "Mr. Robot".
Return a JSON object containing nodes (characters) and links (plot connections).

CHARACTERS:
You MUST use these exact names to match the image database:
- Elliot Alderson
- Mr. Robot
- Darlene Alderson
- Angela Moss
- Tyrell Wellick
- Whiterose
- Phillip Price
- Dominique DiPierro
- Joanna Wellick
- Leon
- Krista Gordon
- Irving
- Fernando Vera
- Gideon Goddard
- Shayla Nico
- Trenton
- Mobley
- Romero
- Janice

CONNECTIONS:
Ensure the links describe specific MAJOR plot points.
Classify groups accurately.
`;

export const fetchMrRobotData = async (): Promise<GraphData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Analyze the TV Series 'Mr. Robot'. Generate a network graph of the top 15 most important characters and their critical plot relationships.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique snake_case ID" },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: "Job title or role in the show" },
                  group: { 
                    type: Type.STRING, 
                    enum: [
                        NodeType.Protagonist, 
                        NodeType.Antagonist, 
                        NodeType.Hacker, 
                        NodeType.Corporate, 
                        NodeType.Civilian
                    ] 
                  },
                  description: { type: Type.STRING, description: "A concise 2-sentence bio emphasizing their motivation." },
                },
                required: ["id", "name", "role", "group", "description"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "ID of source character" },
                  target: { type: Type.STRING, description: "ID of target character" },
                  plotPoint: { type: Type.STRING, description: "Short description of the plot connection (e.g. 'Conspired to execute 5/9 hack')" },
                  strength: { type: Type.NUMBER, description: "Connection strength 1-10" }
                },
                required: ["source", "target", "plotPoint", "strength"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini");

    const data = JSON.parse(text) as GraphData;

    // Post-process to attach images
    const enhancedNodes = data.nodes.map(node => {
        let finalUrl = FALLBACK_IMAGE;
        
        // Normalize for fuzzy matching
        const normalizedNodeName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const foundKey = Object.keys(WIKI_IMAGES).find(key => {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            // Check exact, includes, or reverse includes
            return normalizedKey === normalizedNodeName || 
                   normalizedKey.includes(normalizedNodeName) || 
                   normalizedNodeName.includes(normalizedKey);
        });
        
        if (foundKey) {
            finalUrl = getProxiedUrl(WIKI_IMAGES[foundKey]);
        }

        return {
            ...node,
            imageUrl: finalUrl
        };
    });

    return {
        nodes: enhancedNodes,
        links: data.links
    };

  } catch (error) {
    console.error("Gemini Graph Error:", error);
    throw error;
  }
};