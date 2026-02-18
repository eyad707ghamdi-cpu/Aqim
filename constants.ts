
import { Translation, Language, AthkarCategory, ThemeColor, Muezzin, NumberFormat, Reciter, FontFamily, DuaCategory } from './types';

export const themeOptions: ThemeColor[] = ['green', 'blue', 'brown', 'purple', 'indigo', 'rose', 'teal', 'sand', 'sky', 'mint', 'lavender', 'gold', 'cream'];

export const THEMES: Record<ThemeColor | 'dark', any> = {
  green: { primary: 'bg-emerald-600', secondary: 'bg-emerald-50', accent: 'text-emerald-600', textMain: 'text-emerald-950', textMuted: 'text-emerald-800/60', border: 'border-emerald-100', gradient: 'from-emerald-600 to-teal-700', card: 'bg-white' },
  blue: { primary: 'bg-blue-600', secondary: 'bg-blue-50', accent: 'text-blue-600', textMain: 'text-blue-950', textMuted: 'text-blue-800/60', border: 'border-blue-100', gradient: 'from-blue-600 to-indigo-700', card: 'bg-white' },
  brown: { primary: 'bg-amber-800', secondary: 'bg-amber-50', accent: 'text-amber-800', textMain: 'text-amber-950', textMuted: 'text-amber-800/60', border: 'border-amber-100', gradient: 'from-amber-800 to-orange-900', card: 'bg-white' },
  purple: { primary: 'bg-purple-600', secondary: 'bg-purple-50', accent: 'text-purple-600', textMain: 'text-purple-950', textMuted: 'text-purple-800/60', border: 'border-purple-100', gradient: 'from-purple-600 to-fuchsia-700', card: 'bg-white' },
  indigo: { primary: 'bg-indigo-600', secondary: 'bg-indigo-50', accent: 'text-indigo-600', textMain: 'text-indigo-950', textMuted: 'text-indigo-800/60', border: 'border-indigo-100', gradient: 'from-indigo-600 to-blue-700', card: 'bg-white' },
  rose: { primary: 'bg-rose-600', secondary: 'bg-rose-50', accent: 'text-rose-600', textMain: 'text-rose-950', textMuted: 'text-rose-800/60', border: 'border-rose-100', gradient: 'from-rose-600 to-pink-700', card: 'bg-white' },
  teal: { primary: 'bg-teal-600', secondary: 'bg-teal-50', accent: 'text-teal-600', textMain: 'text-teal-950', textMuted: 'text-teal-800/60', border: 'border-teal-100', gradient: 'from-teal-600 to-emerald-700', card: 'bg-white' },
  sand: { primary: 'bg-orange-600', secondary: 'bg-orange-50', accent: 'text-orange-600', textMain: 'text-orange-950', textMuted: 'text-orange-800/60', border: 'border-orange-100', gradient: 'from-orange-600 to-amber-700', card: 'bg-white' },
  sky: { primary: 'bg-sky-500', secondary: 'bg-sky-50', accent: 'text-sky-600', textMain: 'text-sky-950', textMuted: 'text-sky-800/60', border: 'border-sky-100', gradient: 'from-sky-500 to-blue-600', card: 'bg-white' },
  mint: { primary: 'bg-mint-500', secondary: 'bg-mint-50', accent: 'text-mint-600', textMain: 'text-mint-950', textMuted: 'text-mint-800/60', border: 'border-mint-100', gradient: 'from-emerald-400 to-teal-500', card: 'bg-white' },
  lavender: { primary: 'bg-violet-500', secondary: 'bg-violet-50', accent: 'text-violet-600', textMain: 'text-violet-950', textMuted: 'text-violet-800/60', border: 'border-violet-100', gradient: 'from-violet-500 to-purple-600', card: 'bg-white' },
  gold: { primary: 'bg-yellow-600', secondary: 'bg-yellow-50', accent: 'text-yellow-600', textMain: 'text-yellow-950', textMuted: 'text-yellow-800/60', border: 'border-yellow-100', gradient: 'from-yellow-500 to-amber-600', card: 'bg-white' },
  cream: { primary: 'bg-orange-400', secondary: 'bg-orange-50', accent: 'text-orange-500', textMain: 'text-orange-950', textMuted: 'text-orange-800/60', border: 'border-orange-100', gradient: 'from-orange-300 to-amber-400', card: 'bg-white' },
  dark: { primary: 'bg-zinc-800', secondary: 'bg-zinc-900', accent: 'text-amber-400', textMain: 'text-white', textMuted: 'text-zinc-400', border: 'border-zinc-800', gradient: 'from-zinc-900 via-zinc-900 to-zinc-950', card: 'bg-zinc-900' }
};

export const MUEZZINS: Muezzin[] = [
  { id: 'makkah', name: 'مكة المكرمة', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'madinah', name: 'المدينة المنورة', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'al-quds', name: 'القدس الشريف', url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' }
];

export const TRANSLATIONS: Record<string, Translation> = {
  ar: {
    title: 'أقِم',
    community: 'المجتمع',
    addComment: 'إضافة منشور',
    nameOptional: 'الاسم (اختياري)',
    nameRequired: 'الاسم مطلوب',
    ageOptional: 'العمر (اختياري)',
    messageRequired: 'الرسالة مطلوبة',
    send: 'إرسال',
    like: 'أعجبني',
    report: 'إبلاغ',
    delete: 'حذف',
    reply: 'رد',
    devMode: 'وضع المطور',
    enterPin: 'أدخل الرمز السري',
    wrongPin: 'الرمز السري خاطئ',
    inappropriateContent: 'محتوى غير لائق',
    fontFamilyLabel: 'نوع الخط',
    duas: 'الأدعية',
    athkar: 'الأذكار',
    qibla: 'القبلة',
    aminName: 'أقِم AI',
    settings: 'الإعدادات',
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    goodMorning: 'صباح الخير',
    goodEvening: 'مساء الخير',
    detectingLocation: 'جاري تحديد موقعك...',
    nextPrayer: 'الصلاة القادمة',
    count: 'العدد',
    reset: 'تصفير',
    stopAdhan: 'إيقاف الأذان',
    adhanStarted: 'بدأ أذان',
    locationError: 'يرجى تفعيل الموقع للحصول على مواقيت دقيقة',
    completed: 'تم بنجاح',
    ayahs: 'آية',
    searchSurah: 'ابحث عن سورة...',
    chooseReciter: 'اختر القارئ',
    failedAudio: 'فشل تشغيل الصوت',
    suggestIdeas: 'اقترح فكرة للتطبيق',
    joinUs: 'انضم للقناة',
    telegramChannel: 'قناة التلجرام الرسمية',
    plusMember: 'عضو أقِم بلس',
    badgeCheck: 'توثيق الحساب',
    removeAds: 'إزالة الإعلانات',
    aiFeatures: 'مزايا ذكاء اصطناعي',
    unlimitedAI: 'استخدام AI بلا حدود',
    yourName: 'اسمك',
    suggestionPlaceholder: 'اكتب اقتراحك هنا لنجعل التطبيق أفضل...',
    sendSuggestion: 'إرسال الاقتراح'
  },
  en: {
    title: 'Aqim',
    community: 'Community',
    addComment: 'Add Post',
    nameOptional: 'Name (Optional)',
    nameRequired: 'Name Required',
    ageOptional: 'Age (Optional)',
    messageRequired: 'Message Required',
    send: 'Send',
    like: 'Like',
    report: 'Report',
    delete: 'Delete',
    reply: 'Reply',
    devMode: 'Dev Mode',
    enterPin: 'Enter PIN',
    wrongPin: 'Wrong PIN',
    inappropriateContent: 'Inappropriate Content',
    fontFamilyLabel: 'Font Family',
    duas: 'Duas',
    athkar: 'Athkar',
    qibla: 'Qibla',
    aminName: 'Aqim AI',
    settings: 'Settings',
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    goodMorning: 'Good Morning',
    goodEvening: 'Good Evening',
    detectingLocation: 'Detecting location...',
    nextPrayer: 'Next Prayer',
    count: 'Count',
    reset: 'Reset',
    stopAdhan: 'Stop Adhan',
    adhanStarted: 'Adhan started',
    locationError: 'Please enable location for accurate times',
    completed: 'Completed',
    ayahs: 'Verses',
    searchSurah: 'Search Surah...',
    chooseReciter: 'Choose Reciter',
    failedAudio: 'Audio playback failed',
    suggestIdeas: 'Suggest an idea',
    joinUs: 'Join Channel',
    telegramChannel: 'Official Telegram Channel',
    plusMember: 'Aqim Plus Member',
    badgeCheck: 'Verified Badge',
    removeAds: 'No Ads',
    aiFeatures: 'AI Features',
    unlimitedAI: 'Unlimited AI Chat',
    yourName: 'Your Name',
    suggestionPlaceholder: 'Write your suggestion here...',
    sendSuggestion: 'Send Suggestion'
  }
};

export const formatDigits = (val: string | number, format: NumberFormat = 'latin') => {
  const str = String(val);
  if (format === 'latin') return str;
  const map: Record<string, string> = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
  return str.replace(/[0-9]/g, (d) => map[d]);
};

export const FONT_OPTIONS: { id: FontFamily; name: string; family: string }[] = [
  { id: 'noto', name: 'Noto Sans', family: "'Noto Sans Arabic', sans-serif" },
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'cairo', name: 'Cairo', family: "'Cairo', sans-serif" },
  { id: 'almarai', name: 'Almarai', family: "'Almarai', sans-serif" },
  { id: 'tajawal', name: 'Tajawal', family: "'Tajawal', sans-serif" }
];

export const WISDOMS: string[] = ["الصلاة خير من النوم", "أرحنا بها يا بلال", "الصلاة عماد الدين"];

export const QURRA: Reciter[] = [
  { id: 1, name: 'عبد الباسط عبد الصمد', subName: 'Abdelbasset Abdessamad', slug: '001' },
  { id: 3, name: 'عبد الرحمن السديس', subName: 'Abderrahman Al-Soudais', slug: '003' },
  { id: 6, name: 'محمود خليل الحصري', subName: 'Mahmoud Khalil Al-Hussary', slug: '006' },
  { id: 7, name: 'مشاري راشد العفاسي', subName: 'Mishary Rashid Alafasy', slug: '007' },
  { id: 10, name: 'سعود الشريم', subName: 'Saud Al-Shuraim', slug: '010' },
  { id: 12, name: 'محمد صديق المنشاوي', subName: 'Mohamed Siddiq Al-Minshawi', slug: '012' }
];

export const QURAN_TRANSLATIONS: Record<Language, { id: number; name: string }> = {
  ar: { id: 0, name: 'العربية' },
  en: { id: 131, name: 'English' },
  id: { id: 33, name: 'Indonesian' },
  ur: { id: 158, name: 'Urdu' },
  fr: { id: 31, name: 'French' },
  fa: { id: 21, name: 'Persian' },
  ru: { id: 78, name: 'Russian' },
  tr: { id: 156, name: 'Turkish' },
  es: { id: 232, name: 'Spanish' }
};

export interface Inspiration {
  text: string;
  source?: string;
  type: 'hadith' | 'quote' | 'sunnah';
}

export const DAILY_INSPIRATIONS: Record<string, Inspiration[]> = {
  ar: [
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "صحيح البخاري", type: "hadith" },
    { text: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوقُوتًا", source: "سورة النساء", type: "quote" },
    { text: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", source: "سنن الترمذي", type: "hadith" },
    { text: "اللهمَّ أعنِّي على ذكرِك وشكرِك وحسنِ عبادتِك", source: "دعاء نبوي", type: "sunnah" },
    { text: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ", source: "صحيح البخاري", type: "hadith" }
  ],
  en: [
    { text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.", source: "Sahih Bukhari", type: "hadith" },
    { text: "Prayer has been enjoined on the believers at fixed times.", source: "Surah An-Nisa", type: "quote" },
    { text: "Smiling in the face of your brother is charity.", source: "Tirmidhi", type: "hadith" }
  ]
};

export const ATHKAR_DATA: Record<string, AthkarCategory[]> = {
  ar: [
    {
      id: 'morning',
      title: 'أذكار الصباح',
      items: [
        { text: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير", repeat: 1 },
        { text: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور", repeat: 1 },
        { text: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت", repeat: 1 },
        { text: "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين", repeat: 1 },
        { text: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت", repeat: 3 },
        { text: "اللهم إني أعوذ بك من الكفر والفقر، اللهم إني أعوذ بك من عذاب القبر، لا إله إلا أنت", repeat: 3 },
        { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", repeat: 100 },
        { text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة", repeat: 1 },
        { text: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم", repeat: 3 },
        { text: "رضيت بالله رباً وبالإسلام ديناً وبمحمد صلى الله عليه وسلم نبياً", repeat: 3 },
        { text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم", repeat: 7 }
      ]
    },
    {
      id: 'evening',
      title: 'أذكار المساء',
      items: [
        { text: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير", repeat: 1 },
        { text: "اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير", repeat: 1 },
        { text: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال", repeat: 1 },
        { text: "أعوذ بكلمات الله التامات من شر ما خلق", repeat: 3 },
        { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", repeat: 100 },
        { text: "اللهم صلِ وسلم على نبينا محمد", repeat: 10 }
      ]
    },
    {
      id: 'after_prayer',
      title: 'أذكار ما بعد الصلاة',
      items: [
        { text: "أستغفر الله", repeat: 3 },
        { text: "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام", repeat: 1 },
        { text: "سُبْحَانَ اللهِ", repeat: 33 },
        { text: "الْحَمْدُ للهِ", repeat: 33 },
        { text: "اللهُ أَكْبَرُ", repeat: 33 },
        { text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير", repeat: 1 },
        { text: "آية الكرسي (الله لا إله إلا هو الحي القيوم...)", repeat: 1 }
      ]
    },
    {
      id: 'sleep',
      title: 'أذكار النوم',
      items: [
        { text: "باسمك ربي وضعت جنبي وبك أرفعه، فإن أمسكت نفسي فارحمها، وإن أرسلتها فاحفظها بما تحفظ به عبادك الصالحين", repeat: 1 },
        { text: "اللهم باسمك أموت وأحيا", repeat: 1 },
        { text: "اللهم قني عذابك يوم تبعث عبادك", repeat: 3 },
        { text: "قراءة سورة الإخلاص والمعوذتين والنفث في الكفين", repeat: 3 }
      ]
    }
  ],
  en: [
    {
      id: 'morning',
      title: 'Morning Athkar',
      items: [
        { text: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner...", repeat: 1 },
        { text: "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.", repeat: 1 },
        { text: "Subhanallah wa bihamdihi (Glory be to Allah and all praise is due to Him)", repeat: 100 }
      ]
    },
    {
      id: 'evening',
      title: 'Evening Athkar',
      items: [
        { text: "We have reached the evening and at this very time unto Allah belongs all sovereignty...", repeat: 1 },
        { text: "I seek refuge in Allah's perfect words from the evil of what He has created.", repeat: 3 }
      ]
    }
  ]
};

export const DUAS_DATA: Record<string, DuaCategory[]> = {
  ar: [
    {
      id: 'prophetic',
      title: 'أدعية نبوية',
      items: [
        { id: 'p1', text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", source: "صحيح مسلم" },
        { id: 'p2', text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك", source: "أبو داود والنسائي" },
        { id: 'p3', text: "اللهم إنك عفو تحب العفو فاعف عني", source: "الترمذي وابن ماجه" },
        { id: 'p4', text: "يا مقلب القلوب ثبت قلبي على دينك", source: "الترمذي" },
        { id: 'p5', text: "اللهم إني أسألك الجنة وأعوذ بك من النار", source: "أبو داود" }
      ]
    },
    {
      id: 'quranic',
      title: 'أدعية قرآنية',
      items: [
        { id: 'q1', text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", source: "سورة البقرة" },
        { id: 'q2', text: "رَبَّنَا لا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً", source: "سورة آل عمران" },
        { id: 'q3', text: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ", source: "سورة إبراهيم" },
        { id: 'q4', text: "رَبِّ اشْرَحْ لي صَدْرِي وَيَسِّرْ لي أَمْرِي", source: "سورة طه" }
      ]
    },
    {
      id: 'distress',
      title: 'أدعية الكرب',
      items: [
        { id: 'd1', text: "لا إله إلا أنت سبحانك إني كنت من الظالمين", source: "سورة الأنبياء" },
        { id: 'd2', text: "حسبنا الله ونعم الوكيل", source: "سورة آل عمران" },
        { id: 'd3', text: "اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله، لا إله إلا أنت", source: "أبو داود" },
        { id: 'd4', text: "اللهم إني عبدك، ابن عبدك، ابن أمتك، ناصيتي بيدك، ماض في حكمك، عدل في قضاؤك...", source: "مسند الإمام أحمد" }
      ]
    },
    {
      id: 'travel',
      title: 'دعاء السفر',
      items: [
        { id: 't1', text: "سُبْحانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", source: "سورة الزخرف" },
        { id: 't2', text: "اللهم إنا نسألك في سفرنا هذا البر والتقوى، ومن العمل ما ترضى، اللهم هون علينا سفرنا هذا واطوِ عنا بعده", source: "صحيح مسلم" }
      ]
    }
  ],
  en: [
    {
      id: 'prophetic',
      title: 'Prophetic Duas',
      items: [
        { id: 'p1_en', text: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.", source: "Sahih Muslim" },
        { id: 'p2_en', text: "O Allah, help me to remember You, to thank You, and to worship You in the best of manners.", source: "Abu Dawood" }
      ]
    }
  ]
};
