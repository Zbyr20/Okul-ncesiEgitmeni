import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "") {
      throw new Error("GEMINI_API_KEY is missing or not configured.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function getCharacterStory(character: string) {
  try {
    const ai = getGenAI();

    const prompt = `ROL: Türkiye'deki 3-6 yaş arası çocuklar için "Okul Öncesi Eğitmeni".

KURAL 1: Cevaba asla "Merhaba", "Selam" veya giriş cümlesiyle başlama.
KURAL 2: Giriş kelimen sadece seçilen [HARF] ile başlayan bir nesne veya [SAYI] ismi olmalı.
KURAL 3: Konuşma süresini uzun tut (40-60 kelime arası). Hikayeleştirme yap.
KURAL 4: GÜVENLİK VE YASAL UYUM: Şiddet, korku, siyaset, reklam veya kişisel veri isteği yasaktır. Sadece doğa, hayvanlar ve oyuncaklar üzerinden örnek ver.
KURAL 5: ETKİLEŞİM: Cümlenin sonunda çocuğa fiziksel bir görev ver (Örn: "Zıpla", "Havada çiz", "Gözlerini kapat").

Kullanıcı "${character}" karakterine dokundu.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Boş yanıt alındı.");
    }

    const forbiddenWords = ["siyaset", "korku", "ölüm", "şiddet", "kötü"];
    const hasForbiddenWord = forbiddenWords.some((word) =>
      text.toLowerCase().includes(word)
    );

    if (hasForbiddenWord) {
      return "Harika bir gün! Haydi başka bir harf seçelim ve yeni bir oyun oynayalım.";
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error Details:", error);
    if (error instanceof Error && (error.message.includes("GEMINI_API_KEY") || error.message.includes("API key not valid"))) {
      return "Arkadaşın şu an anahtarını bulamıyor veya anahtar geçersiz. Lütfen ebeveyninden Secrets/Sırlar panelini kontrol etmesini iste!";
    }
    return "Arkadaşın şu an biraz dinleniyor. Lütfen bir saniye sonra tekrar dene veya ebeveynine haber ver!";
  }
}
