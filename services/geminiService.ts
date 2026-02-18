import { GoogleGenAI } from "@google/genai";

export async function askAmin(prompt: string, language: string, base64Image?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [{ text: prompt }];
  
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
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: `أنت "أقِم AI"، مساعد ذكاء اصطناعي إسلامي متخصص حصرياً في المسائل الدينية والشرعية.
      
      نطاق العمل:
      - أجب فقط على الأسئلة المتعلقة بالإسلام (عقيدة، فقه، سيرة، قرآن، سنة، أخلاق إسلامية).
      - إذا سألك المستخدم عن أي موضوع خارج هذا النطاق (مثل العلوم العامة، التكنولوجيا، الرياضة، الترفيه، أو الدردشة العامة غير الهادفة)، يجب أن تعتذر بلباقة وتوضح أنك مخصص للأسئلة الدينية فقط.
      
      البحث والفتوى:
      - استخدم أداة البحث للعثور على الإجابة من موقع "islamqa.info" أولاً وبالأساس.
      - يجب أن تكون إجابتك مبنية على الأدلة الشرعية.
      - إذا بحثت ولم تجد فتوى واضحة في المصادر الموثوقة، قل نصاً: "لم اجد مصدر شرعي عن فتواك".
      
      اللغة:
      - التزم باللغة التي يتحدث بها المستخدم: ${language}.`,
      tools: [{ googleSearch: {} }],
      temperature: 0.1, 
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "مصدر شرعي",
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];

  return {
    text: response.text || "",
    sources: sources
  };
}