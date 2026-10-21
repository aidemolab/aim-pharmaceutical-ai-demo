/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side endpoint proxy for Gemini API chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, appStateSummary } = req.body;
      
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured. Please add it via the Secrets panel in AI Studio."
        });
      }

      // Initialize the GoogleGenAI client
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // System instruction setting persona, context, and data
      const systemInstruction = `You are an expert pharmaceutical business analyst advising a new import-and-distribution pharmaceutical company entering a market with no historical sales.
You are supporting management decisions on product pilot imports, pricing, margin, and pharmacy engagement.

CORE RULES:
1. All mathematical and metrics calculations (Opportunity Score, Suggested Pilot Import Quantities, Pricing and Margin calculations, Break-Even Volume, Gross margins, etc.) are calculated in the client UI using precise TypeScript formulas. Do NOT invent new formulas or calculations. Rely on the client calculations provided to you.
2. The user has access to a live interactive dashboard. Speak strategically, providing concise business advisory, target audience recommendations, risk analysis, and marketing strategies, rather than raw dry calculations.
3. STRICT RESPONSE FORMAT (CRITICAL):
   - Answer the user's question directly in exactly 2 to 3 sentences maximum for the opening paragraph.
   - Follow with a list of supporting reasoning containing at most 3 bullet points. Each bullet point MUST be exactly one sentence.
   - End with exactly one short follow-up suggestion, which must be exactly one sentence.
   - DO NOT use any headers, subheaders, bold text, italic text, markdown formatting (such as asterisks or underscores for styling), code blocks, or horizontal lines.
   - The entire response must be readable in under 30 seconds.
   - The tone must be conversational, warm, and direct—like a smart business advisor speaking to a client, not a written or formal report. No stiff corporate jargon.
4. Do not mention system-internal or technical implementation details like "process.env", "React", "TypeScript", or "Express". Speak directly as a senior strategy consultant.

EXECUTIVE DATA AND METRICS REFERENCE:
${appStateSummary || "Data is active in the decision-support system."}
`;

      // Format messages into GoogleGenAI content schema
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Generate content via Gemini 3.5 Flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      let cleanText = response.text || "";
      // Strip markdown bold formatting (**text** or __text__)
      cleanText = cleanText.replace(/\*\*([\s\S]*?)\*\*/g, "$1");
      cleanText = cleanText.replace(/__([\s\S]*?)__/g, "$1");
      // Strip headers (e.g. ### Header or # Header)
      cleanText = cleanText.replace(/^\s*#+\s*(.*)$/gm, "$1");
      // Strip inline code blocks
      cleanText = cleanText.replace(/`([^`]+)`/g, "$1");
      // Strip horizontal rules
      cleanText = cleanText.replace(/^\s*[-*_]{3,}\s*$/gm, "");

      return res.json({ text: cleanText });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "An error occurred with the Gemini API." });
    }
  });

  // Serve static assets/Vite app
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
