import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, language = 'ar', base64Image } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "مفتاح Gemini API غير متوفر في إعدادات الخادم" });
    }

    const ai = new GoogleGenAI({
      apiKey,
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

    return res.status(200).json({
      text: response.text || "",
      sources: sources
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "حدث خطأ أثناء معالجة الطلب" });
  }
}
