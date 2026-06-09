import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route for Gemini
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, language, base64Image } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const queryWithSiteFilter = `الرجاء البحث في موقع https://islamqa.info/ar أو https://islamqa.info للإجابة على السؤال التالي:\n${prompt}`;
      const parts: any[] = [{ text: queryWithSiteFilter }];

      if (base64Image) {
        const data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
        parts.unshift({
          inlineData: {
            mimeType: "image/jpeg",
            data: data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          systemInstruction: `أنت "أقِم AI"، مساعد ذكاء اصطناعي إسلامي.
          
          يجب أن تأخذ الأجوبة وتبحث عنها فقط وحصرياً من هذا الموقع: https://islamqa.info/ar
          استخدم أداة البحث لتغطية الموقع islamqa.info.
          إذا لم تجد الإجابة من موقع islamqa.info، اعتذر للمستخدم وقل أنك لم تجد فتوى مطابقة.
          
          تحدث باللغة: ${language}.`,
          tools: [{ googleSearch: {} }],
          temperature: 0.1, 
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "مصدر شرعي",
        uri: chunk.web?.uri
      })).filter((s: any) => s.uri) || [];

      res.json({
        text: response.text || "",
        sources: sources
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
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
