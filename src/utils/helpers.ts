import { format, parse } from 'date-fns';

export const toBengaliNumber = (num: string | number): string => {
  if (num === undefined || num === null) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export const formatTime = (timeStr: string, language: 'en' | 'bn'): string => {
  if (!timeStr || typeof timeStr !== 'string') return '';
  // API sometimes returns time with timezone like "05:12 (BST)"
  const cleanTime = timeStr.split(' ')[0];
  const parts = cleanTime.split(':');
  if (parts.length < 2) return timeStr;
  
  const [hours, minutes] = parts;
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  try {
    const formatted = format(date, 'hh:mm a');
    if (language === 'bn') {
      return toBengaliNumber(formatted)
        .replace('AM', 'ভোর')
        .replace('PM', 'সন্ধ্যা');
    }
    return formatted;
  } catch (e) {
    return timeStr;
  }
};

export const getNextEvent = (timings: any) => {
  if (!timings) return null;
  const now = new Date();
  
  const safeParse = (time: string) => {
    if (!time || typeof time !== 'string') return now;
    const cleanTime = time.split(' ')[0];
    try {
      return parse(cleanTime, 'HH:mm', now);
    } catch (e) {
      return now;
    }
  };

  const events = [
    { type: 'Fajr', time: safeParse(timings.Fajr), labelEn: 'Fajr', labelBn: 'ফজর' },
    { type: 'Sunrise', time: safeParse(timings.Sunrise), labelEn: 'Sunrise', labelBn: 'সূর্যোদয়' },
    { type: 'Dhuhr', time: safeParse(timings.Dhuhr), labelEn: 'Dhuhr', labelBn: 'জোহর' },
    { type: 'Asr', time: safeParse(timings.Asr), labelEn: 'Asr', labelBn: 'আসর' },
    { type: 'Maghrib', time: safeParse(timings.Maghrib), labelEn: 'Maghrib', labelBn: 'মাগরিব' },
    { type: 'Isha', time: safeParse(timings.Isha || timings.Ishaa), labelEn: 'Isha', labelBn: 'এশা' },
  ];

  // Sort events by time
  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  const next = events.find(e => e.time > now);

  if (next) {
    // Special labels for Sehri/Iftar during Ramadan
    if (next.type === 'Fajr') return { ...next, labelEn: 'Sehri', labelBn: 'সেহরি' };
    if (next.type === 'Maghrib') return { ...next, labelEn: 'Iftar', labelBn: 'ইফতার' };
    return next;
  }

  // If no events left today, next is tomorrow's Fajr
  const tomorrowFajr = new Date(events.find(e => e.type === 'Fajr')!.time);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { type: 'Fajr', time: tomorrowFajr, labelEn: 'Sehri', labelBn: 'সেহরি' };
};

export const getTimeRemaining = (timeStr: string, language: 'en' | 'bn' = 'en'): string | null => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const now = new Date();
  const cleanTime = timeStr.split(' ')[0];
  try {
    const targetTime = parse(cleanTime, 'HH:mm', now);
    
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const diff = targetTime.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    
    if (language === 'bn') {
      const hStr = h > 0 ? `${toBengaliNumber(h)} ঘণ্টা ` : '';
      const mStr = `${toBengaliNumber(m)} মিনিট`;
      return hStr + mStr;
    }

    const hStr = h > 0 ? `${h}h ` : '';
    const mStr = `${m}m`;
    return hStr + mStr;
  } catch (e) {
    return null;
  }
};

export const getHijriMonthBn = (monthEn: string): string => {
  const months: Record<string, string> = {
    'Muharram': 'মুহররম',
    'Safar': 'সফর',
    'Rabi\' al-awwal': 'রবিউল আউয়াল',
    'Rabi\' ath-thani': 'রবিউস সানি',
    'Jumada al-ula': 'জমাদিউল আউয়াল',
    'Jumada al-akhira': 'জমাদিউস সানি',
    'Rajab': 'রজব',
    'Sha\'ban': 'শাবান',
    'Ramadan': 'রমজান',
    'Shawwal': 'শাওয়াল',
    'Dhu al-Qi\'dah': 'জিলকদ',
    'Dhu al-Hijjah': 'জিলহজ'
  };
  return months[monthEn] || monthEn;
};

export const getRamadanDay = (date: Date): number | null => {
  const ramadanStart = new Date(2026, 1, 19);
  // Reset hours to compare dates only
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
  const diff = d1.getTime() - d2.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  if (day >= 1 && day <= 30) return day;
  return null;
};

export const calculateQibla = (lat: number, lng: number): number => {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  
  const φ1 = lat * (Math.PI / 180);
  const φ2 = kaabaLat * (Math.PI / 180);
  const Δλ = (kaabaLng - lng) * (Math.PI / 180);
  
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  
  return (qibla + 360) % 360;
};
