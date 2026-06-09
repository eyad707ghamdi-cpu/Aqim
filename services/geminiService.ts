import { GoogleGenAI } from "@google/genai";

export async function askAmin(prompt: string, language: string, base64Image?: string) {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language, base64Image })
  });

  if (!response.ok) {
    let errMsg = 'API Error';
    try {
      const errBody = await response.json();
      errMsg = errBody.error || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return response.json();
}