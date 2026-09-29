import { QuranVerse } from '../types';

const versesCache: Record<number, QuranVerse[]> = {};
const audioCache: Record<string, string> = {};
const tafsirCache: Record<string, string> = {};

/**
 * جلب آيات السورة بالرسم العثماني الأصلي من Quran.com دون تغيير أي حرف
 */
export async function getChapterVerses(chapterId: number): Promise<QuranVerse[]> {
  if (versesCache[chapterId]) {
    return versesCache[chapterId];
  }

  // محاولة القراءة من sessionStorage
  try {
    const cached = sessionStorage.getItem(`quran_verses_${chapterId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      versesCache[chapterId] = parsed;
      return parsed;
    }
  } catch (e) {}

  const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`);
  if (!response.ok) {
    throw new Error('فشل تحميل آيات السورة من المصدر');
  }

  const data = await response.json();
  const verses: QuranVerse[] = data.verses || [];
  versesCache[chapterId] = verses;

  try {
    sessionStorage.setItem(`quran_verses_${chapterId}`, JSON.stringify(verses));
  } catch (e) {}

  return verses;
}

/**
 * جلب رابط التلاوة الصوتية للسورة من Quran.com
 */
export async function getChapterAudio(reciterId: number, chapterId: number): Promise<string | null> {
  const cacheKey = `${reciterId}_${chapterId}`;
  if (audioCache[cacheKey]) {
    return audioCache[cacheKey];
  }

  try {
    const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapterId}`);
    if (!response.ok) return null;
    const data = await response.json();
    const url = data.audio_file?.audio_url || null;
    if (url) {
      audioCache[cacheKey] = url;
    }
    return url;
  } catch (e) {
    console.error('Audio fetch error:', e);
    return null;
  }
}

/**
 * جلب تفسير الآية من Quran.com (تفسير الميسر افتراضياً)
 */
export async function getAyahTafsir(verseKey: string, tafsirId: number = 16): Promise<string | null> {
  const cacheKey = `${tafsirId}_${verseKey}`;
  if (tafsirCache[cacheKey]) {
    return tafsirCache[cacheKey];
  }

  try {
    const response = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    let text = data.tafsir?.text || '';
    // تنظيف وسوم الـ HTML غير المرغوبة مع الحفاظ على النص
    text = text.replace(/<[^>]*>/g, '').trim();
    if (text) {
      tafsirCache[cacheKey] = text;
    }
    return text;
  } catch (e) {
    console.error('Tafsir fetch error:', e);
    return null;
  }
}
