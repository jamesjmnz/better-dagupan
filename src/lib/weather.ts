import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  type LucideIcon,
  Moon,
  Sun,
} from 'lucide-react';

import { HourlyForecast, WeatherApiCity, WeatherData } from '../types';
import { fetchWithCache, HttpError } from './api';
import { config } from './lguConfig';

/**
 * The Lucide icons `mapWeatherIconToLucide` can name, keyed by that name.
 */
export const weatherIcons: Record<string, LucideIcon> = {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
};

/**
 * Map OpenWeatherMap icon codes to Lucide icon names
 */
export const mapWeatherIconToLucide = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'Sun',
    '01n': 'Moon',
    '02d': 'CloudSun',
    '02n': 'CloudMoon',
    '03d': 'Cloud',
    '03n': 'Cloud',
    '04d': 'Cloud',
    '04n': 'Cloud',
    '09d': 'CloudDrizzle',
    '09n': 'CloudDrizzle',
    '10d': 'CloudRain',
    '10n': 'CloudRain',
    '11d': 'CloudLightning',
    '11n': 'CloudLightning',
    '13d': 'CloudSnow',
    '13n': 'CloudSnow',
    '50d': 'Cloud',
    '50n': 'Cloud',
  };
  return iconMap[iconCode] || 'Cloud';
};

/**
 * Fetch weather data for configured LGU and transform to frontend type
 */
export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  // Normalize city name for API call (handle special characters)
  const cityName = config.location.weather.defaultCity;
  const cityKey = config.lgu.name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/ñ/g, 'n');

  let data: Record<string, WeatherApiCity>;
  try {
    // Always fetch specific city
    data = await fetchWithCache<Record<string, WeatherApiCity>>(
      `/api/weather?city=${encodeURIComponent(cityName)}`
    );

    // If KV is empty or city missing, fallback to update
    if (!data || Object.keys(data).length === 0) {
      data = await fetchWithCache<Record<string, WeatherApiCity>>(
        '/api/weather?update=true'
      );
    }
  } catch (error) {
    // 503 means the deployment has no weather API key: nothing to show.
    if (error instanceof HttpError && error.status === 503) return [];
    throw error;
  }

  const city =
    data[cityKey] ||
    data[config.lgu.name.toLowerCase()] ||
    data[Object.keys(data)[0]];
  if (!city) {
    // Fallback in case API completely failed
    console.warn(`No weather data returned for ${config.lgu.name}`);
    return [];
  }

  // Transform 3-hour forecast (first 4 entries)
  const hourly: HourlyForecast[] = (city.hourly || []).slice(0, 4).map(h => ({
    hour: new Date(h.dt * 1000).toLocaleTimeString([], {
      hour: 'numeric',
      hour12: true,
    }),
    temperature: Math.round(h.temp),
    icon: mapWeatherIconToLucide(h.icon),
  }));

  const weatherData: WeatherData = {
    location: city.name || config.lgu.name,
    temperature: Math.round(city.main?.temp ?? 0),
    condition: city.weather?.[0]?.description ?? 'Unknown',
    humidity: city.main?.humidity ?? 0,
    windSpeed: city.wind?.speed ?? 0,
    icon: mapWeatherIconToLucide(city.weather?.[0]?.icon ?? '01d'),
    hourly,
    pressure: city.main?.pressure ?? 0,
    visibility: Math.round((city.visibility ?? 0) / 1000),
  };

  return [weatherData];
};
