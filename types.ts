
export type Language = 'ar' | 'en' | 'id' | 'ur' | 'fr' | 'fa' | 'ru' | 'tr' | 'es';
export type ThemeColor = 'green' | 'blue' | 'brown' | 'purple' | 'indigo' | 'rose' | 'teal' | 'sand' | 'sky' | 'mint' | 'lavender' | 'gold' | 'cream';
export type TimeFormat = '12h' | '24h';
export type NumberFormat = 'arabic' | 'latin';
export type SubscriptionTier = 'none' | 'plus';
export type LoadingVariant = 'default' | 'continuous';
export type FontFamily = 'noto' | 'amiri' | 'cairo' | 'almarai' | 'tajawal';

// Added AuthUser interface to fix missing import in AuthModal.tsx
export interface AuthUser {
  uid: string;
  username: string;
  email?: string;
}

export interface AthkarItem {
  text: string;
  repeat: number;
}

export interface AthkarCategory {
  id: string;
  title: string;
  items: AthkarItem[];
}

export interface DuaItem {
  id: string;
  text: string;
  source: string;
  translation?: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  items: DuaItem[];
}

export interface Muezzin {
  id: string;
  name: string;
  url: string;
}

export interface Reciter {
  id: number;
  name: string;
  subName: string;
  slug: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  key: string;
}

export interface Comment {
  id: string;
  ownerId: string;
  name?: string;
  age?: string;
  message: string;
  originalMessage?: string;
  timestamp: number;
  likes: number;
  reports: number;
  isDeveloper?: boolean;
}

export interface CommunityReply {
  id: string;
  postId: string;
  ownerId: string;
  name: string;
  message: string;
  image?: string;
  timestamp: number;
  likes: number;
  isDeveloper: boolean;
  replyToName?: string;
}

export interface Suggestion {
  id: string;
  ownerId: string;
  name: string; 
  age?: string; 
  text: string;
  originalText?: string;
  timestamp: number;
  likes: number;
  reports: number;
  image?: string;
  devReply?: string;
}

export interface UserSettings {
  language: Language;
  accentColor: ThemeColor;
  isDarkMode: boolean;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  notificationsEnabled: boolean;
  selectedMuezzin: string;
  hasCompletedOnboarding: boolean;
  loadingVariant: LoadingVariant;
  fontFamily: FontFamily;
  userName?: string;
  selectedReciterId?: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  isDeveloperMode: boolean;
  points: number;
}

export interface Translation {
  title: string;
  community: string;
  addComment: string;
  nameOptional: string;
  nameRequired: string; 
  ageOptional: string;
  messageRequired: string;
  send: string;
  like: string;
  report: string;
  delete: string;
  reply: string;
  devMode: string;
  enterPin: string;
  wrongPin: string;
  onboardingStep?: string;
  inappropriateContent: string;
  fontFamilyLabel: string;
  duas: string;
  [key: string]: any;
}
