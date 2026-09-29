export interface ChapterMeta {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
  bismillah_pre: boolean;
  pages: [number, number];
}

export const QURAN_CHAPTERS: ChapterMeta[] = [
  {
    "id": 1,
    "name_arabic": "الفاتحة",
    "name_simple": "Al-Fatihah",
    "revelation_place": "makkah",
    "verses_count": 7,
    "bismillah_pre": false,
    "pages": [
      1,
      1
    ]
  },
  {
    "id": 2,
    "name_arabic": "البقرة",
    "name_simple": "Al-Baqarah",
    "revelation_place": "madinah",
    "verses_count": 286,
    "bismillah_pre": true,
    "pages": [
      2,
      49
    ]
  },
  {
    "id": 3,
    "name_arabic": "آل عمران",
    "name_simple": "Ali 'Imran",
    "revelation_place": "madinah",
    "verses_count": 200,
    "bismillah_pre": true,
    "pages": [
      50,
      76
    ]
  },
  {
    "id": 4,
    "name_arabic": "النساء",
    "name_simple": "An-Nisa",
    "revelation_place": "madinah",
    "verses_count": 176,
    "bismillah_pre": true,
    "pages": [
      77,
      106
    ]
  },
  {
    "id": 5,
    "name_arabic": "المائدة",
    "name_simple": "Al-Ma'idah",
    "revelation_place": "madinah",
    "verses_count": 120,
    "bismillah_pre": true,
    "pages": [
      106,
      127
    ]
  },
  {
    "id": 6,
    "name_arabic": "الأنعام",
    "name_simple": "Al-An'am",
    "revelation_place": "makkah",
    "verses_count": 165,
    "bismillah_pre": true,
    "pages": [
      128,
      150
    ]
  },
  {
    "id": 7,
    "name_arabic": "الأعراف",
    "name_simple": "Al-A'raf",
    "revelation_place": "makkah",
    "verses_count": 206,
    "bismillah_pre": true,
    "pages": [
      151,
      176
    ]
  },
  {
    "id": 8,
    "name_arabic": "الأنفال",
    "name_simple": "Al-Anfal",
    "revelation_place": "madinah",
    "verses_count": 75,
    "bismillah_pre": true,
    "pages": [
      177,
      186
    ]
  },
  {
    "id": 9,
    "name_arabic": "التوبة",
    "name_simple": "At-Tawbah",
    "revelation_place": "madinah",
    "verses_count": 129,
    "bismillah_pre": false,
    "pages": [
      187,
      207
    ]
  },
  {
    "id": 10,
    "name_arabic": "يونس",
    "name_simple": "Yunus",
    "revelation_place": "makkah",
    "verses_count": 109,
    "bismillah_pre": true,
    "pages": [
      208,
      221
    ]
  },
  {
    "id": 11,
    "name_arabic": "هود",
    "name_simple": "Hud",
    "revelation_place": "makkah",
    "verses_count": 123,
    "bismillah_pre": true,
    "pages": [
      221,
      235
    ]
  },
  {
    "id": 12,
    "name_arabic": "يوسف",
    "name_simple": "Yusuf",
    "revelation_place": "makkah",
    "verses_count": 111,
    "bismillah_pre": true,
    "pages": [
      235,
      248
    ]
  },
  {
    "id": 13,
    "name_arabic": "الرعد",
    "name_simple": "Ar-Ra'd",
    "revelation_place": "madinah",
    "verses_count": 43,
    "bismillah_pre": true,
    "pages": [
      249,
      255
    ]
  },
  {
    "id": 14,
    "name_arabic": "ابراهيم",
    "name_simple": "Ibrahim",
    "revelation_place": "makkah",
    "verses_count": 52,
    "bismillah_pre": true,
    "pages": [
      255,
      261
    ]
  },
  {
    "id": 15,
    "name_arabic": "الحجر",
    "name_simple": "Al-Hijr",
    "revelation_place": "makkah",
    "verses_count": 99,
    "bismillah_pre": true,
    "pages": [
      262,
      267
    ]
  },
  {
    "id": 16,
    "name_arabic": "النحل",
    "name_simple": "An-Nahl",
    "revelation_place": "makkah",
    "verses_count": 128,
    "bismillah_pre": true,
    "pages": [
      267,
      281
    ]
  },
  {
    "id": 17,
    "name_arabic": "الإسراء",
    "name_simple": "Al-Isra",
    "revelation_place": "makkah",
    "verses_count": 111,
    "bismillah_pre": true,
    "pages": [
      282,
      293
    ]
  },
  {
    "id": 18,
    "name_arabic": "الكهف",
    "name_simple": "Al-Kahf",
    "revelation_place": "makkah",
    "verses_count": 110,
    "bismillah_pre": true,
    "pages": [
      293,
      304
    ]
  },
  {
    "id": 19,
    "name_arabic": "مريم",
    "name_simple": "Maryam",
    "revelation_place": "makkah",
    "verses_count": 98,
    "bismillah_pre": true,
    "pages": [
      305,
      312
    ]
  },
  {
    "id": 20,
    "name_arabic": "طه",
    "name_simple": "Taha",
    "revelation_place": "makkah",
    "verses_count": 135,
    "bismillah_pre": true,
    "pages": [
      312,
      321
    ]
  },
  {
    "id": 21,
    "name_arabic": "الأنبياء",
    "name_simple": "Al-Anbya",
    "revelation_place": "makkah",
    "verses_count": 112,
    "bismillah_pre": true,
    "pages": [
      322,
      331
    ]
  },
  {
    "id": 22,
    "name_arabic": "الحج",
    "name_simple": "Al-Hajj",
    "revelation_place": "madinah",
    "verses_count": 78,
    "bismillah_pre": true,
    "pages": [
      332,
      341
    ]
  },
  {
    "id": 23,
    "name_arabic": "المؤمنون",
    "name_simple": "Al-Mu'minun",
    "revelation_place": "makkah",
    "verses_count": 118,
    "bismillah_pre": true,
    "pages": [
      342,
      349
    ]
  },
  {
    "id": 24,
    "name_arabic": "النور",
    "name_simple": "An-Nur",
    "revelation_place": "madinah",
    "verses_count": 64,
    "bismillah_pre": true,
    "pages": [
      350,
      359
    ]
  },
  {
    "id": 25,
    "name_arabic": "الفرقان",
    "name_simple": "Al-Furqan",
    "revelation_place": "makkah",
    "verses_count": 77,
    "bismillah_pre": true,
    "pages": [
      359,
      366
    ]
  },
  {
    "id": 26,
    "name_arabic": "الشعراء",
    "name_simple": "Ash-Shu'ara",
    "revelation_place": "makkah",
    "verses_count": 227,
    "bismillah_pre": true,
    "pages": [
      367,
      376
    ]
  },
  {
    "id": 27,
    "name_arabic": "النمل",
    "name_simple": "An-Naml",
    "revelation_place": "makkah",
    "verses_count": 93,
    "bismillah_pre": true,
    "pages": [
      377,
      385
    ]
  },
  {
    "id": 28,
    "name_arabic": "القصص",
    "name_simple": "Al-Qasas",
    "revelation_place": "makkah",
    "verses_count": 88,
    "bismillah_pre": true,
    "pages": [
      385,
      396
    ]
  },
  {
    "id": 29,
    "name_arabic": "العنكبوت",
    "name_simple": "Al-'Ankabut",
    "revelation_place": "makkah",
    "verses_count": 69,
    "bismillah_pre": true,
    "pages": [
      396,
      404
    ]
  },
  {
    "id": 30,
    "name_arabic": "الروم",
    "name_simple": "Ar-Rum",
    "revelation_place": "makkah",
    "verses_count": 60,
    "bismillah_pre": true,
    "pages": [
      404,
      410
    ]
  },
  {
    "id": 31,
    "name_arabic": "لقمان",
    "name_simple": "Luqman",
    "revelation_place": "makkah",
    "verses_count": 34,
    "bismillah_pre": true,
    "pages": [
      411,
      414
    ]
  },
  {
    "id": 32,
    "name_arabic": "السجدة",
    "name_simple": "As-Sajdah",
    "revelation_place": "makkah",
    "verses_count": 30,
    "bismillah_pre": true,
    "pages": [
      415,
      417
    ]
  },
  {
    "id": 33,
    "name_arabic": "الأحزاب",
    "name_simple": "Al-Ahzab",
    "revelation_place": "madinah",
    "verses_count": 73,
    "bismillah_pre": true,
    "pages": [
      418,
      427
    ]
  },
  {
    "id": 34,
    "name_arabic": "سبإ",
    "name_simple": "Saba",
    "revelation_place": "makkah",
    "verses_count": 54,
    "bismillah_pre": true,
    "pages": [
      428,
      434
    ]
  },
  {
    "id": 35,
    "name_arabic": "فاطر",
    "name_simple": "Fatir",
    "revelation_place": "makkah",
    "verses_count": 45,
    "bismillah_pre": true,
    "pages": [
      434,
      440
    ]
  },
  {
    "id": 36,
    "name_arabic": "يس",
    "name_simple": "Ya-Sin",
    "revelation_place": "makkah",
    "verses_count": 83,
    "bismillah_pre": true,
    "pages": [
      440,
      445
    ]
  },
  {
    "id": 37,
    "name_arabic": "الصافات",
    "name_simple": "As-Saffat",
    "revelation_place": "makkah",
    "verses_count": 182,
    "bismillah_pre": true,
    "pages": [
      446,
      452
    ]
  },
  {
    "id": 38,
    "name_arabic": "ص",
    "name_simple": "Sad",
    "revelation_place": "makkah",
    "verses_count": 88,
    "bismillah_pre": true,
    "pages": [
      453,
      458
    ]
  },
  {
    "id": 39,
    "name_arabic": "الزمر",
    "name_simple": "Az-Zumar",
    "revelation_place": "makkah",
    "verses_count": 75,
    "bismillah_pre": true,
    "pages": [
      458,
      467
    ]
  },
  {
    "id": 40,
    "name_arabic": "غافر",
    "name_simple": "Ghafir",
    "revelation_place": "makkah",
    "verses_count": 85,
    "bismillah_pre": true,
    "pages": [
      467,
      476
    ]
  },
  {
    "id": 41,
    "name_arabic": "فصلت",
    "name_simple": "Fussilat",
    "revelation_place": "makkah",
    "verses_count": 54,
    "bismillah_pre": true,
    "pages": [
      477,
      482
    ]
  },
  {
    "id": 42,
    "name_arabic": "الشورى",
    "name_simple": "Ash-Shuraa",
    "revelation_place": "makkah",
    "verses_count": 53,
    "bismillah_pre": true,
    "pages": [
      483,
      489
    ]
  },
  {
    "id": 43,
    "name_arabic": "الزخرف",
    "name_simple": "Az-Zukhruf",
    "revelation_place": "makkah",
    "verses_count": 89,
    "bismillah_pre": true,
    "pages": [
      489,
      495
    ]
  },
  {
    "id": 44,
    "name_arabic": "الدخان",
    "name_simple": "Ad-Dukhan",
    "revelation_place": "makkah",
    "verses_count": 59,
    "bismillah_pre": true,
    "pages": [
      496,
      498
    ]
  },
  {
    "id": 45,
    "name_arabic": "الجاثية",
    "name_simple": "Al-Jathiyah",
    "revelation_place": "makkah",
    "verses_count": 37,
    "bismillah_pre": true,
    "pages": [
      499,
      502
    ]
  },
  {
    "id": 46,
    "name_arabic": "الأحقاف",
    "name_simple": "Al-Ahqaf",
    "revelation_place": "makkah",
    "verses_count": 35,
    "bismillah_pre": true,
    "pages": [
      502,
      506
    ]
  },
  {
    "id": 47,
    "name_arabic": "محمد",
    "name_simple": "Muhammad",
    "revelation_place": "madinah",
    "verses_count": 38,
    "bismillah_pre": true,
    "pages": [
      507,
      510
    ]
  },
  {
    "id": 48,
    "name_arabic": "الفتح",
    "name_simple": "Al-Fath",
    "revelation_place": "madinah",
    "verses_count": 29,
    "bismillah_pre": true,
    "pages": [
      511,
      515
    ]
  },
  {
    "id": 49,
    "name_arabic": "الحجرات",
    "name_simple": "Al-Hujurat",
    "revelation_place": "madinah",
    "verses_count": 18,
    "bismillah_pre": true,
    "pages": [
      515,
      517
    ]
  },
  {
    "id": 50,
    "name_arabic": "ق",
    "name_simple": "Qaf",
    "revelation_place": "makkah",
    "verses_count": 45,
    "bismillah_pre": true,
    "pages": [
      518,
      520
    ]
  },
  {
    "id": 51,
    "name_arabic": "الذاريات",
    "name_simple": "Adh-Dhariyat",
    "revelation_place": "makkah",
    "verses_count": 60,
    "bismillah_pre": true,
    "pages": [
      520,
      523
    ]
  },
  {
    "id": 52,
    "name_arabic": "الطور",
    "name_simple": "At-Tur",
    "revelation_place": "makkah",
    "verses_count": 49,
    "bismillah_pre": true,
    "pages": [
      523,
      525
    ]
  },
  {
    "id": 53,
    "name_arabic": "النجم",
    "name_simple": "An-Najm",
    "revelation_place": "makkah",
    "verses_count": 62,
    "bismillah_pre": true,
    "pages": [
      526,
      528
    ]
  },
  {
    "id": 54,
    "name_arabic": "القمر",
    "name_simple": "Al-Qamar",
    "revelation_place": "makkah",
    "verses_count": 55,
    "bismillah_pre": true,
    "pages": [
      528,
      531
    ]
  },
  {
    "id": 55,
    "name_arabic": "الرحمن",
    "name_simple": "Ar-Rahman",
    "revelation_place": "madinah",
    "verses_count": 78,
    "bismillah_pre": true,
    "pages": [
      531,
      534
    ]
  },
  {
    "id": 56,
    "name_arabic": "الواقعة",
    "name_simple": "Al-Waqi'ah",
    "revelation_place": "makkah",
    "verses_count": 96,
    "bismillah_pre": true,
    "pages": [
      534,
      537
    ]
  },
  {
    "id": 57,
    "name_arabic": "الحديد",
    "name_simple": "Al-Hadid",
    "revelation_place": "madinah",
    "verses_count": 29,
    "bismillah_pre": true,
    "pages": [
      537,
      541
    ]
  },
  {
    "id": 58,
    "name_arabic": "المجادلة",
    "name_simple": "Al-Mujadila",
    "revelation_place": "madinah",
    "verses_count": 22,
    "bismillah_pre": true,
    "pages": [
      542,
      545
    ]
  },
  {
    "id": 59,
    "name_arabic": "الحشر",
    "name_simple": "Al-Hashr",
    "revelation_place": "madinah",
    "verses_count": 24,
    "bismillah_pre": true,
    "pages": [
      545,
      548
    ]
  },
  {
    "id": 60,
    "name_arabic": "الممتحنة",
    "name_simple": "Al-Mumtahanah",
    "revelation_place": "madinah",
    "verses_count": 13,
    "bismillah_pre": true,
    "pages": [
      549,
      551
    ]
  },
  {
    "id": 61,
    "name_arabic": "الصف",
    "name_simple": "As-Saf",
    "revelation_place": "madinah",
    "verses_count": 14,
    "bismillah_pre": true,
    "pages": [
      551,
      552
    ]
  },
  {
    "id": 62,
    "name_arabic": "الجمعة",
    "name_simple": "Al-Jumu'ah",
    "revelation_place": "madinah",
    "verses_count": 11,
    "bismillah_pre": true,
    "pages": [
      553,
      554
    ]
  },
  {
    "id": 63,
    "name_arabic": "المنافقون",
    "name_simple": "Al-Munafiqun",
    "revelation_place": "madinah",
    "verses_count": 11,
    "bismillah_pre": true,
    "pages": [
      554,
      555
    ]
  },
  {
    "id": 64,
    "name_arabic": "التغابن",
    "name_simple": "At-Taghabun",
    "revelation_place": "madinah",
    "verses_count": 18,
    "bismillah_pre": true,
    "pages": [
      556,
      557
    ]
  },
  {
    "id": 65,
    "name_arabic": "الطلاق",
    "name_simple": "At-Talaq",
    "revelation_place": "madinah",
    "verses_count": 12,
    "bismillah_pre": true,
    "pages": [
      558,
      559
    ]
  },
  {
    "id": 66,
    "name_arabic": "التحريم",
    "name_simple": "At-Tahrim",
    "revelation_place": "madinah",
    "verses_count": 12,
    "bismillah_pre": true,
    "pages": [
      560,
      561
    ]
  },
  {
    "id": 67,
    "name_arabic": "الملك",
    "name_simple": "Al-Mulk",
    "revelation_place": "makkah",
    "verses_count": 30,
    "bismillah_pre": true,
    "pages": [
      562,
      564
    ]
  },
  {
    "id": 68,
    "name_arabic": "القلم",
    "name_simple": "Al-Qalam",
    "revelation_place": "makkah",
    "verses_count": 52,
    "bismillah_pre": true,
    "pages": [
      564,
      566
    ]
  },
  {
    "id": 69,
    "name_arabic": "الحاقة",
    "name_simple": "Al-Haqqah",
    "revelation_place": "makkah",
    "verses_count": 52,
    "bismillah_pre": true,
    "pages": [
      566,
      568
    ]
  },
  {
    "id": 70,
    "name_arabic": "المعارج",
    "name_simple": "Al-Ma'arij",
    "revelation_place": "makkah",
    "verses_count": 44,
    "bismillah_pre": true,
    "pages": [
      568,
      570
    ]
  },
  {
    "id": 71,
    "name_arabic": "نوح",
    "name_simple": "Nuh",
    "revelation_place": "makkah",
    "verses_count": 28,
    "bismillah_pre": true,
    "pages": [
      570,
      571
    ]
  },
  {
    "id": 72,
    "name_arabic": "الجن",
    "name_simple": "Al-Jinn",
    "revelation_place": "makkah",
    "verses_count": 28,
    "bismillah_pre": true,
    "pages": [
      572,
      573
    ]
  },
  {
    "id": 73,
    "name_arabic": "المزمل",
    "name_simple": "Al-Muzzammil",
    "revelation_place": "makkah",
    "verses_count": 20,
    "bismillah_pre": true,
    "pages": [
      574,
      575
    ]
  },
  {
    "id": 74,
    "name_arabic": "المدثر",
    "name_simple": "Al-Muddaththir",
    "revelation_place": "makkah",
    "verses_count": 56,
    "bismillah_pre": true,
    "pages": [
      575,
      577
    ]
  },
  {
    "id": 75,
    "name_arabic": "القيامة",
    "name_simple": "Al-Qiyamah",
    "revelation_place": "makkah",
    "verses_count": 40,
    "bismillah_pre": true,
    "pages": [
      577,
      578
    ]
  },
  {
    "id": 76,
    "name_arabic": "الانسان",
    "name_simple": "Al-Insan",
    "revelation_place": "madinah",
    "verses_count": 31,
    "bismillah_pre": true,
    "pages": [
      578,
      580
    ]
  },
  {
    "id": 77,
    "name_arabic": "المرسلات",
    "name_simple": "Al-Mursalat",
    "revelation_place": "makkah",
    "verses_count": 50,
    "bismillah_pre": true,
    "pages": [
      580,
      581
    ]
  },
  {
    "id": 78,
    "name_arabic": "النبإ",
    "name_simple": "An-Naba",
    "revelation_place": "makkah",
    "verses_count": 40,
    "bismillah_pre": true,
    "pages": [
      582,
      583
    ]
  },
  {
    "id": 79,
    "name_arabic": "النازعات",
    "name_simple": "An-Nazi'at",
    "revelation_place": "makkah",
    "verses_count": 46,
    "bismillah_pre": true,
    "pages": [
      583,
      584
    ]
  },
  {
    "id": 80,
    "name_arabic": "عبس",
    "name_simple": "'Abasa",
    "revelation_place": "makkah",
    "verses_count": 42,
    "bismillah_pre": true,
    "pages": [
      585,
      585
    ]
  },
  {
    "id": 81,
    "name_arabic": "التكوير",
    "name_simple": "At-Takwir",
    "revelation_place": "makkah",
    "verses_count": 29,
    "bismillah_pre": true,
    "pages": [
      586,
      586
    ]
  },
  {
    "id": 82,
    "name_arabic": "الإنفطار",
    "name_simple": "Al-Infitar",
    "revelation_place": "makkah",
    "verses_count": 19,
    "bismillah_pre": true,
    "pages": [
      587,
      587
    ]
  },
  {
    "id": 83,
    "name_arabic": "المطففين",
    "name_simple": "Al-Mutaffifin",
    "revelation_place": "makkah",
    "verses_count": 36,
    "bismillah_pre": true,
    "pages": [
      587,
      589
    ]
  },
  {
    "id": 84,
    "name_arabic": "الإنشقاق",
    "name_simple": "Al-Inshiqaq",
    "revelation_place": "makkah",
    "verses_count": 25,
    "bismillah_pre": true,
    "pages": [
      589,
      589
    ]
  },
  {
    "id": 85,
    "name_arabic": "البروج",
    "name_simple": "Al-Buruj",
    "revelation_place": "makkah",
    "verses_count": 22,
    "bismillah_pre": true,
    "pages": [
      590,
      590
    ]
  },
  {
    "id": 86,
    "name_arabic": "الطارق",
    "name_simple": "At-Tariq",
    "revelation_place": "makkah",
    "verses_count": 17,
    "bismillah_pre": true,
    "pages": [
      591,
      591
    ]
  },
  {
    "id": 87,
    "name_arabic": "الأعلى",
    "name_simple": "Al-A'la",
    "revelation_place": "makkah",
    "verses_count": 19,
    "bismillah_pre": true,
    "pages": [
      591,
      592
    ]
  },
  {
    "id": 88,
    "name_arabic": "الغاشية",
    "name_simple": "Al-Ghashiyah",
    "revelation_place": "makkah",
    "verses_count": 26,
    "bismillah_pre": true,
    "pages": [
      592,
      592
    ]
  },
  {
    "id": 89,
    "name_arabic": "الفجر",
    "name_simple": "Al-Fajr",
    "revelation_place": "makkah",
    "verses_count": 30,
    "bismillah_pre": true,
    "pages": [
      593,
      594
    ]
  },
  {
    "id": 90,
    "name_arabic": "البلد",
    "name_simple": "Al-Balad",
    "revelation_place": "makkah",
    "verses_count": 20,
    "bismillah_pre": true,
    "pages": [
      594,
      594
    ]
  },
  {
    "id": 91,
    "name_arabic": "الشمس",
    "name_simple": "Ash-Shams",
    "revelation_place": "makkah",
    "verses_count": 15,
    "bismillah_pre": true,
    "pages": [
      595,
      595
    ]
  },
  {
    "id": 92,
    "name_arabic": "الليل",
    "name_simple": "Al-Layl",
    "revelation_place": "makkah",
    "verses_count": 21,
    "bismillah_pre": true,
    "pages": [
      595,
      596
    ]
  },
  {
    "id": 93,
    "name_arabic": "الضحى",
    "name_simple": "Ad-Duhaa",
    "revelation_place": "makkah",
    "verses_count": 11,
    "bismillah_pre": true,
    "pages": [
      596,
      596
    ]
  },
  {
    "id": 94,
    "name_arabic": "الشرح",
    "name_simple": "Ash-Sharh",
    "revelation_place": "makkah",
    "verses_count": 8,
    "bismillah_pre": true,
    "pages": [
      596,
      596
    ]
  },
  {
    "id": 95,
    "name_arabic": "التين",
    "name_simple": "At-Tin",
    "revelation_place": "makkah",
    "verses_count": 8,
    "bismillah_pre": true,
    "pages": [
      597,
      597
    ]
  },
  {
    "id": 96,
    "name_arabic": "العلق",
    "name_simple": "Al-'Alaq",
    "revelation_place": "makkah",
    "verses_count": 19,
    "bismillah_pre": true,
    "pages": [
      597,
      597
    ]
  },
  {
    "id": 97,
    "name_arabic": "القدر",
    "name_simple": "Al-Qadr",
    "revelation_place": "makkah",
    "verses_count": 5,
    "bismillah_pre": true,
    "pages": [
      598,
      598
    ]
  },
  {
    "id": 98,
    "name_arabic": "البينة",
    "name_simple": "Al-Bayyinah",
    "revelation_place": "madinah",
    "verses_count": 8,
    "bismillah_pre": true,
    "pages": [
      598,
      599
    ]
  },
  {
    "id": 99,
    "name_arabic": "الزلزلة",
    "name_simple": "Az-Zalzalah",
    "revelation_place": "madinah",
    "verses_count": 8,
    "bismillah_pre": true,
    "pages": [
      599,
      599
    ]
  },
  {
    "id": 100,
    "name_arabic": "العاديات",
    "name_simple": "Al-'Adiyat",
    "revelation_place": "makkah",
    "verses_count": 11,
    "bismillah_pre": true,
    "pages": [
      599,
      600
    ]
  },
  {
    "id": 101,
    "name_arabic": "القارعة",
    "name_simple": "Al-Qari'ah",
    "revelation_place": "makkah",
    "verses_count": 11,
    "bismillah_pre": true,
    "pages": [
      600,
      600
    ]
  },
  {
    "id": 102,
    "name_arabic": "التكاثر",
    "name_simple": "At-Takathur",
    "revelation_place": "makkah",
    "verses_count": 8,
    "bismillah_pre": true,
    "pages": [
      600,
      600
    ]
  },
  {
    "id": 103,
    "name_arabic": "العصر",
    "name_simple": "Al-'Asr",
    "revelation_place": "makkah",
    "verses_count": 3,
    "bismillah_pre": true,
    "pages": [
      601,
      601
    ]
  },
  {
    "id": 104,
    "name_arabic": "الهمزة",
    "name_simple": "Al-Humazah",
    "revelation_place": "makkah",
    "verses_count": 9,
    "bismillah_pre": true,
    "pages": [
      601,
      601
    ]
  },
  {
    "id": 105,
    "name_arabic": "الفيل",
    "name_simple": "Al-Fil",
    "revelation_place": "makkah",
    "verses_count": 5,
    "bismillah_pre": true,
    "pages": [
      601,
      601
    ]
  },
  {
    "id": 106,
    "name_arabic": "قريش",
    "name_simple": "Quraysh",
    "revelation_place": "makkah",
    "verses_count": 4,
    "bismillah_pre": true,
    "pages": [
      602,
      602
    ]
  },
  {
    "id": 107,
    "name_arabic": "الماعون",
    "name_simple": "Al-Ma'un",
    "revelation_place": "makkah",
    "verses_count": 7,
    "bismillah_pre": true,
    "pages": [
      602,
      602
    ]
  },
  {
    "id": 108,
    "name_arabic": "الكوثر",
    "name_simple": "Al-Kawthar",
    "revelation_place": "makkah",
    "verses_count": 3,
    "bismillah_pre": true,
    "pages": [
      602,
      602
    ]
  },
  {
    "id": 109,
    "name_arabic": "الكافرون",
    "name_simple": "Al-Kafirun",
    "revelation_place": "makkah",
    "verses_count": 6,
    "bismillah_pre": true,
    "pages": [
      603,
      603
    ]
  },
  {
    "id": 110,
    "name_arabic": "النصر",
    "name_simple": "An-Nasr",
    "revelation_place": "madinah",
    "verses_count": 3,
    "bismillah_pre": true,
    "pages": [
      603,
      603
    ]
  },
  {
    "id": 111,
    "name_arabic": "المسد",
    "name_simple": "Al-Masad",
    "revelation_place": "makkah",
    "verses_count": 5,
    "bismillah_pre": true,
    "pages": [
      603,
      603
    ]
  },
  {
    "id": 112,
    "name_arabic": "الإخلاص",
    "name_simple": "Al-Ikhlas",
    "revelation_place": "makkah",
    "verses_count": 4,
    "bismillah_pre": true,
    "pages": [
      604,
      604
    ]
  },
  {
    "id": 113,
    "name_arabic": "الفلق",
    "name_simple": "Al-Falaq",
    "revelation_place": "makkah",
    "verses_count": 5,
    "bismillah_pre": true,
    "pages": [
      604,
      604
    ]
  },
  {
    "id": 114,
    "name_arabic": "الناس",
    "name_simple": "An-Nas",
    "revelation_place": "makkah",
    "verses_count": 6,
    "bismillah_pre": true,
    "pages": [
      604,
      604
    ]
  }
];

export function getChapterByPage(pageNum: number): ChapterMeta {
  const p = Math.max(1, Math.min(Math.round(pageNum || 1), 604));
  return QURAN_CHAPTERS.find(ch => p >= ch.pages[0] && p <= ch.pages[1]) || QURAN_CHAPTERS[0];
}
