import axios from 'axios';

const BASE_URL = 'https://api.aladhan.com/v1';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar?: string };
  month: { number: number; en: string; ar?: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

export interface DayData {
  timings: PrayerTimes;
  date: {
    readable: string;
    timestamp: string;
    hijri: HijriDate;
    gregorian: { date: string; day: string; month: { number: number; en: string }; year: string };
  };
}

export const fetchCalendarByDistrict = async (lat: number, lng: number, month: number, year: number): Promise<DayData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/calendar`, {
      params: {
        latitude: lat,
        longitude: lng,
        method: 1, // University of Islamic Sciences, Karachi (Standard for Subcontinent)
        school: 1, // Hanafi (Standard for Bangladesh)
        month: month,
        year: year,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

export const fetchTodayTimes = async (lat: number, lng: number): Promise<DayData> => {
  try {
    const response = await axios.get(`${BASE_URL}/timings`, {
      params: {
        latitude: lat,
        longitude: lng,
        method: 1,
        school: 1, // Hanafi
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching today times:', error);
    throw error;
  }
};
