import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/extract-actions", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Extract a list of actionable tasks from the following text.
For each task, estimate its duration in minutes (between 5 and 480, multiples of 5), its energy demand (1=Low, 2=Medium, 3=High), urgency (1=Low, 2=Medium, 3=High), strategic relevance (1=Low, 2=Medium, 3=High), and required context ("Anywhere", "Computer", "Phone", "Errands").

Text to process:
"""
${text}
"""`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "The name of the action (e.g., 'Draft weekly project update'). Must not be empty."
                    },
                    estimatedDurationMins: {
                      type: Type.INTEGER,
                      description: "Estimated duration in minutes (5 to 480)"
                    },
                    energyDemand: {
                      type: Type.INTEGER,
                      description: "1=Low, 2=Medium, 3=High"
                    },
                    urgency: {
                      type: Type.INTEGER,
                      description: "1=Low, 2=Medium, 3=High"
                    },
                    strategicRelevance: {
                      type: Type.INTEGER,
                      description: "1=Low, 2=Medium, 3=High"
                    },
                    context: {
                      type: Type.STRING,
                      description: "One of: 'Anywhere', 'Computer', 'Phone', 'Errands'"
                    }
                  },
                  required: [
                    "name",
                    "estimatedDurationMins",
                    "energyDemand",
                    "urgency",
                    "strategicRelevance",
                    "context"
                  ]
                }
              }
            },
            required: ["actions"]
          }
        }
      });

      const jsonStr = response.text;
      if (!jsonStr) {
        return res.status(500).json({ error: "Model returned empty response" });
      }

      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: error.message || "Failed to extract actions" });
    }
  });

  app.post("/api/analyze-delegation", async (req, res) => {
    try {
      const { actionName, harnesses, personalData } = req.body;
      if (!actionName) {
        return res.status(400).json({ error: "Action name is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const promptText = `
Analyze the following task to determine if it can be delegated to a large language model or AI agent.

Task: "${actionName}"

Available AI Tools (Harnesses):
${JSON.stringify(harnesses, null, 2)}

User's Personal Data / Reference Info:
${JSON.stringify(personalData, null, 2)}

Identify:
1. Is this delegable?
2. Which harness is best suited for the task?
3. Which large language model is best suited for the task?
4. What the corresponding prompt should look like (use personal data where relevant).
5. Which model configuration should be used (e.g. Haiku vs Opus for Claude, Effort Level, Reasoning Level).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDelegable: {
                type: Type.BOOLEAN,
                description: "Whether the task can be delegated to an AI"
              },
              recommendedHarness: {
                type: Type.STRING,
                description: "Name of the recommended harness"
              },
              recommendedModel: {
                type: Type.STRING,
                description: "Specific model to use (e.g., Haiku, Opus, GPT-4)"
              },
              configuration: {
                type: Type.STRING,
                description: "Configuration settings (e.g., Effort Level: High, Reasoning Level: Low)"
              },
              prompt: {
                type: Type.STRING,
                description: "The prompt to use for the AI"
              },
              rationale: {
                type: Type.STRING,
                description: "Why this recommendation was made"
              }
            },
            required: ["isDelegable", "recommendedHarness", "recommendedModel", "configuration", "prompt", "rationale"]
          }
        }
      });

      const jsonStr = response.text;
      if (!jsonStr) {
        return res.status(500).json({ error: "Model returned empty response" });
      }

      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Delegation analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze delegation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
