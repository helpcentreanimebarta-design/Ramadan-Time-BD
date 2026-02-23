import React, { createContext, useContext, useState, useEffect } from 'react';
import { District, districts } from '../data/districts';
import { DayData, fetchCalendarByDistrict } from '../services/api';

interface AppState {
  district: District;
  language: 'en' | 'bn';
  theme: 'light' | 'dark';
  calendar: DayData[];
  loading: boolean;
  setDistrict: (d: District) => void;
  setLanguage: (l: 'en' | 'bn') => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [district, setDistrictState] = useState<District>(() => {
    const saved = localStorage.getItem('selected_district');
    return saved ? JSON.parse(saved) : districts[0];
  });

  const [language, setLanguageState] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('language') as 'en' | 'bn') || 'bn';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [calendar, setCalendar] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        // Fetch current month
        const data1 = await fetchCalendarByDistrict(district.lat, district.lng, currentMonth, currentYear);
        
        // Fetch next month to ensure full Ramadan coverage
        const nextDate = new Date(now);
        nextDate.setMonth(now.getMonth() + 1);
        const data2 = await fetchCalendarByDistrict(district.lat, district.lng, nextDate.getMonth() + 1, nextDate.getFullYear());
        
        setCalendar([...data1, ...data2]);
      } catch (error) {
        console.error('Failed to load calendar', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [district]);

  const setDistrict = (d: District) => {
    setDistrictState(d);
    localStorage.setItem('selected_district', JSON.stringify(d));
  };

  const setLanguage = (l: 'en' | 'bn') => {
    setLanguageState(l);
    localStorage.setItem('language', l);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AppContext.Provider value={{ district, language, theme, calendar, loading, setDistrict, setLanguage, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
