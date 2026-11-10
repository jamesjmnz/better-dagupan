/**
 * Type Definitions
 *
 * Central TypeScript type definitions and interfaces used throughout the application.
 * Types are organized by domain and function.
 *
 * @module types
 */

export type LanguageType =
  | 'en' // English
  | 'fil' // Filipino (standardized Tagalog)
  | 'pag'; // Pangasinan, offered only when features.pangasinan is enabled

export interface Country {
  name: string;
  code: string;
  flag: string;
  visaRequired: boolean;
  duration?: string;
  specialConditions?: string[];
  requiredDocuments?: string[];
  note?: string;
}

export interface VisaCategory {
  title: string;
  description: string;
  visaTypes: VisaType[];
}

export interface VisaType {
  name: string;
  description: string;
  duration: string;
  requirements: string[];
}

export interface ConstitutionalOffice {
  title: string;
  description: string;
  slug: string;
  icon: string;
}

export interface GovernmentBranch {
  title: string;
  description: string;
  icon: string;
  offices: ConstitutionalOffice[];
}

export interface NavigationItem {
  /** English label, also used as a stable React key. */
  label: string;
  /** i18n key (with its namespace) rendered in place of `label`. */
  labelKey?: string;
  href: string;
  target?: string;
  children?: NavigationItem[];
}

export interface ServiceCategory {
  name: string;
  slug: string;
  services: Service[];
}

export interface QuickInfo {
  label: string;
  value: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Office {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface RelatedService {
  service: string;
  slug: string;
  category?: {
    name: string;
    slug: string;
  };
}

export interface Service {
  service: string;
  url: string;
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
  subcategory: {
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;

  // New optional fields
  steps?: string[];
  requirements?: string[];
  faqs?: FAQ[];
  office?: Office;
  relatedServices?: RelatedService[];
  quickInfo?: QuickInfo[];
}

/** One 3-hour forecast entry as `/api/weather` returns it. */
export interface WeatherApiHourly {
  dt: number;
  temp: number;
  feels_like: number;
  icon: string;
  description: string;
  humidity: number;
  wind_speed: number;
}

/** One city as `/api/weather` returns it, keyed by city in the response. */
export interface WeatherApiCity {
  name?: string;
  weather?: Array<{ description: string; icon: string }>;
  main?: { temp: number; pressure: number; humidity: number };
  wind?: { speed: number };
  visibility?: number;
  hourly?: WeatherApiHourly[];
}

/** A forecast entry after `fetchWeatherData` has shaped it for display. */
export interface HourlyForecast {
  hour: string;
  temperature: number;
  /** A key of `weatherIcons`. */
  icon: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  pressure: number;
  visibility: number;
  hourly: HourlyForecast[];
}

export interface ForexData {
  currency: string;
  code: string;
  rate: number;
  change: number;
  changePercent: number;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  tags: string[];
  content: string;
}

export interface Feedback {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'bug' | 'feature' | 'general';
}

export interface ProjectIdea {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: string;
  createdAt: string;
}

export interface VolunteerRole {
  title: string;
  description: string;
  requirements: string[];
  timeCommitment: string;
  location: 'remote' | 'hybrid' | 'onsite';
  category: 'development' | 'design' | 'content' | 'community' | 'other';
}

export interface ContactInfo {
  name: string;
  position: string;
  email: string;
  phone?: string;
  office?: string;
  address?: string;
}

export interface ForexRate {
  currency: string;
  code: string;
  rate: number;
}

// Re-export domain-specific types from their respective modules
export * from './budgetTypes';
export * from './legislationTypes';
export * from './populationTypes';
export * from './servicesTypes';
export * from './visa';
