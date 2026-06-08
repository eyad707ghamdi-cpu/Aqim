import { GoogleGenAI } from "@google/genai";

export async function askAmin(prompt: string, language: string, base64Image?: string) {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language, base64Image })
  });

  if (!response.ok) {
    throw new Error('API Error');
  }

  return response.json();
}