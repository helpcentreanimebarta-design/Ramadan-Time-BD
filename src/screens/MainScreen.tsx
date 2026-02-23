import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { districts } from '../data/districts';
import { formatTime, getNextEvent, toBengaliNumber, calculateQibla, getHijriMonthBn, getRamadanDay, getTimeRemaining } from '../utils/helpers';
import { Moon, Sun, MapPin, Calendar, Bell, Compass, BookOpen, Settings as SettingsIcon, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QuranView from '../components/QuranView';

const MainScreen: React.FC = () => {
  const { district, language, theme, calendar, loading, setDistrict, setLanguage, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'quran' | 'dua' | 'settings'>('today');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<{ label: string; time: string; icon: React.ReactNode } | null>(null);

  const todayData = calendar.find(d => {
    if (!d?.date?.gregorian?.date) return false;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return d.date.gregorian.date === `${day}-${month}-${year}`;
  }) || calendar[0];

  return (
    <div className="min-h-screen pb-24 font-sans text-slate-900 dark:text-slate-200">
      {/* Header with Profile */}
      <header className="p-6 flex justify-between items-center sticky top-0 z-10 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-xl border-b border-emerald-100 dark:border-emerald-500/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <img 
                src="https://picsum.photos/seed/user123/200/200" 
                alt="User" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#042f2e] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight neon-text">
              {language === 'bn' ? 'রমজান টাইম বিডি' : 'Ramadan Time BD'}
            </h1>
            <button 
              onClick={() => setShowDistrictModal(true)}
              className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity text-emerald-800 dark:text-emerald-400"
            >
              <MapPin size={12} className="text-emerald-500 dark:text-amber-400" />
              {language === 'bn' ? district.nameBn : district.nameEn}
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/10 text-emerald-700 dark:text-amber-400 shadow-sm">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="px-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A5A40]"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'today' && todayData && (
                <TodayView data={todayData} onPrayerClick={setSelectedPrayer} />
              )}
              {activeTab === 'calendar' && (
                <CalendarView calendar={calendar} onPrayerClick={setSelectedPrayer} />
              )}
              {activeTab === 'quran' && (
                <QuranView />
              )}
              {activeTab === 'dua' && (
                <DuaView />
              )}
              {activeTab === 'settings' && (
                <SettingsView />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 glass-card p-2 flex justify-around items-center z-20">
        <NavButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} icon={<Clock size={20} />} label={language === 'bn' ? 'আজ' : 'Today'} />
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label={language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'} />
        <NavButton active={activeTab === 'quran'} onClick={() => setActiveTab('quran')} icon={<BookOpen size={20} />} label={language === 'bn' ? 'কুরআন' : 'Quran'} />
        <NavButton active={activeTab === 'dua'} onClick={() => setActiveTab('dua')} icon={<Compass size={20} />} label={language === 'bn' ? 'দোয়া' : 'Dua'} />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label={language === 'bn' ? 'সেটিংস' : 'Settings'} />
      </nav>

      {/* Prayer Detail Modal */}
      <AnimatePresence>
        {selectedPrayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPrayer(null)}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0a1a1a] rounded-[40px] p-8 text-center shadow-2xl border border-emerald-500/20 overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-amber-400 mx-auto mb-6 border border-emerald-500/20 shadow-inner">
                  {React.cloneElement(selectedPrayer.icon as React.ReactElement, { size: 40 })}
                </div>
                
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700 dark:text-amber-400 mb-2">
                  {selectedPrayer.label}
                </h3>
                
                <h2 className="text-5xl font-mono font-bold tracking-tighter neon-text mb-2">
                  {formatTime(selectedPrayer.time, language)}
                </h2>
                
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/40 dark:text-amber-400/40">
                    {language === 'bn' ? 'বাকি আছে' : 'Time Remaining'}
                  </span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-amber-500">
                    {getTimeRemaining(selectedPrayer.time, language) || '--'}
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedPrayer(null)}
                  className="w-full py-4 rounded-2xl bg-emerald-600 dark:bg-amber-500 text-white dark:text-emerald-950 font-bold shadow-lg shadow-emerald-500/20 dark:shadow-amber-500/20 active:scale-95 transition-transform"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* District Modal */}
      <AnimatePresence>
        {showDistrictModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDistrictModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white dark:bg-[#151510] rounded-t-[32px] sm:rounded-[32px] p-6 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</h2>
                <button onClick={() => setShowDistrictModal(false)} className="p-2 opacity-50">✕</button>
              </div>
              <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-3 pb-6">
                {districts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDistrict(d);
                      setShowDistrictModal(false);
                    }}
                    className={`p-4 rounded-2xl text-left transition-all ${district.id === d.id ? 'bg-[#5A5A40] text-white' : 'bg-black/5 dark:bg-white/5'}`}
                  >
                    <div className="font-bold">{language === 'bn' ? d.nameBn : d.nameEn}</div>
                    <div className="text-xs opacity-70">{language === 'bn' ? d.nameEn : d.nameBn}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${active ? 'nav-item-active' : 'opacity-40 hover:opacity-70'}`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const PrayerRow: React.FC<{ label: string; time: string; icon: React.ReactNode; isNext?: boolean; onClick: () => void }> = ({ label, time, icon, isNext, onClick }) => {
  const { language } = useApp();
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 transition-all text-left active:bg-emerald-500/10 ${isNext ? 'bg-emerald-500/5 dark:bg-amber-500/5' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isNext ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-amber-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/5 opacity-60'}`}>
          {icon}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${isNext ? 'text-emerald-700 dark:text-amber-400' : 'text-stone-600 dark:text-emerald-100/60'}`}>{label}</h4>
          {isNext && <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 dark:text-amber-500 animate-pulse">{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-mono font-bold ${isNext ? 'text-emerald-700 dark:text-amber-400' : 'text-stone-800 dark:text-emerald-50'}`}>
          {formatTime(time, language)}
        </div>
      </div>
    </button>
  );
};

const TodayView: React.FC<{ data: any; onPrayerClick: (p: any) => void }> = ({ data, onPrayerClick }) => {
  const { language } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [nextEvent, setNextEvent] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const event = getNextEvent(data.timings);
      setNextEvent(event);
      
      if (event) {
        const diff = event.time.getTime() - new Date().getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        setTimeLeft(language === 'bn' ? toBengaliNumber(timeStr) : timeStr);
      } else {
        setTimeLeft('--:--:--');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data, language]);

  const ramadanDay = getRamadanDay(new Date());

  return (
    <div className="space-y-6 pt-6">
      {/* Ramadan Day Badge */}
      {ramadanDay && (
        <div className="flex justify-center">
          <div className="px-6 py-1.5 rounded-full bg-emerald-500/10 dark:bg-amber-500/10 border border-emerald-500/20 dark:border-amber-500/20 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-700 dark:text-amber-400 shadow-sm">
            {language === 'bn' ? `রমজান ${toBengaliNumber(ramadanDay)}` : `Ramadan Day ${ramadanDay}`}
          </div>
        </div>
      )}

      {/* Countdown Card */}
      <div className="glass-panel p-8 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10">
          <motion.div 
            className="h-full bg-emerald-500 dark:bg-amber-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] dark:shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            animate={{ width: '100%' }}
            transition={{ duration: 60, repeat: Infinity }}
          />
        </div>
        
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 dark:text-amber-400 font-bold mb-4">
            {nextEvent ? (language === 'bn' ? `${nextEvent.labelBn} বাকি` : `Next: ${nextEvent.labelEn}`) : '...'}
          </p>
          <h2 className="text-6xl font-mono font-bold tracking-tighter mb-6 neon-text">
            {timeLeft}
          </h2>
          
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => onPrayerClick({ label: language === 'bn' ? 'সেহরি' : 'Sehri', time: data.timings.Fajr, icon: <Moon /> })}
              className="px-4 py-2 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-100 dark:border-white/5 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold opacity-70 text-emerald-900 dark:text-emerald-100">
                {language === 'bn' ? 'সেহরি: ' : 'Sehri: '}
                {formatTime(data.timings.Fajr, language)}
              </span>
            </button>
            <button 
              onClick={() => onPrayerClick({ label: language === 'bn' ? 'ইফতার' : 'Iftar', time: data.timings.Maghrib, icon: <Moon /> })}
              className="px-4 py-2 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-100 dark:border-white/5 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <span className="text-xs font-bold opacity-70 text-emerald-900 dark:text-emerald-100">
                {language === 'bn' ? 'ইফতার: ' : 'Iftar: '}
                {formatTime(data.timings.Maghrib, language)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Daily Prayers List */}
      <div className="glass-panel overflow-hidden divide-y divide-emerald-100 dark:divide-white/5 mb-6">
        <div className="p-4 bg-emerald-500/5 dark:bg-white/5 border-b border-emerald-100 dark:border-white/5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-amber-400 text-center">
            {language === 'bn' ? 'দৈনিক ৫ ওয়াক্ত নামাজ' : '5 Daily Prayer Times'}
          </h3>
        </div>
        <PrayerRow 
          label={language === 'bn' ? 'ফজর' : 'Fajr'} 
          time={data.timings.Fajr} 
          icon={<Moon size={18} />} 
          isNext={nextEvent?.type === 'Fajr'}
          onClick={() => onPrayerClick({ label: language === 'bn' ? 'ফজর' : 'Fajr', time: data.timings.Fajr, icon: <Moon /> })}
        />
        <PrayerRow 
          label={language === 'bn' ? 'জোহর' : 'Dhuhr'} 
          time={data.timings.Dhuhr} 
          icon={<Sun size={18} />} 
          isNext={nextEvent?.type === 'Dhuhr'}
          onClick={() => onPrayerClick({ label: language === 'bn' ? 'জোহর' : 'Dhuhr', time: data.timings.Dhuhr, icon: <Sun /> })}
        />
        <PrayerRow 
          label={language === 'bn' ? 'আসর' : 'Asr'} 
          time={data.timings.Asr} 
          icon={<Sun size={18} />} 
          isNext={nextEvent?.type === 'Asr'}
          onClick={() => onPrayerClick({ label: language === 'bn' ? 'আসর' : 'Asr', time: data.timings.Asr, icon: <Sun /> })}
        />
        <PrayerRow 
          label={language === 'bn' ? 'মাগরিব' : 'Maghrib'} 
          time={data.timings.Maghrib} 
          icon={<Moon size={18} />} 
          isNext={nextEvent?.type === 'Maghrib'}
          onClick={() => onPrayerClick({ label: language === 'bn' ? 'মাগরিব (ইফতার)' : 'Maghrib (Iftar)', time: data.timings.Maghrib, icon: <Moon /> })}
        />
        <PrayerRow 
          label={language === 'bn' ? 'এশা' : 'Isha'} 
          time={data.timings.Isha || data.timings.Ishaa} 
          icon={<Moon size={18} />} 
          isNext={nextEvent?.type === 'Isha'}
          onClick={() => onPrayerClick({ label: language === 'bn' ? 'এশা' : 'Isha', time: data.timings.Isha || data.timings.Ishaa, icon: <Moon /> })}
        />
      </div>

      {/* Hijri Date */}
      <div className="glass-card p-4 text-center opacity-80 border-emerald-500/10">
        <p className="text-xs font-bold tracking-widest uppercase text-emerald-900 dark:text-emerald-100">
          {language === 'bn' ? 
            `${toBengaliNumber(data.date.hijri.day)} ${getHijriMonthBn(data.date.hijri.month.en)}, ${toBengaliNumber(data.date.hijri.year)} হিজরি` : 
            `${data.date.hijri.day} ${data.date.hijri.month.en}, ${data.date.hijri.year} Hijri`
          }
        </p>
      </div>
    </div>
  );
};

const TimeCard: React.FC<{ label: string; time: string; icon: React.ReactNode }> = ({ label, time, icon }) => {
  const { language } = useApp();
  return (
    <div className="glass-card p-5 flex flex-col items-start group">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">{formatTime(time, language)}</span>
    </div>
  );
};

const CalendarView: React.FC<{ calendar: any[]; onPrayerClick: (p: any) => void }> = ({ calendar, onPrayerClick }) => {
  const { language } = useApp();
  
  // Filter to start from Feb 19, 2026 (Ramadan 1)
  const ramadanStart = new Date(2026, 1, 19);
  const ramadanDays = calendar.filter(day => {
    if (!day?.date?.gregorian?.date) return false;
    const [d, m, y] = day.date.gregorian.date.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date >= ramadanStart;
  }).slice(0, 30);

  return (
    <div className="space-y-4 pt-6">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold neon-text">
          {language === 'bn' ? 'রমজান ক্যালেন্ডার' : 'Ramadan Calendar'}
        </h2>
        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest pb-1">
          {language === 'bn' ? '১৪৪৭ হিজরি' : '1447 Hijri'}
        </div>
      </div>
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-emerald-500/5 text-[10px] uppercase tracking-widest text-emerald-700 dark:text-amber-400 font-bold">
              <th className="p-4 sticky left-0 bg-white dark:bg-[#151510] z-10">{language === 'bn' ? 'রমজান' : 'Ramadan'}</th>
              <th className="p-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
              <th className="p-4">{language === 'bn' ? 'ফজর' : 'Fajr'}</th>
              <th className="p-4">{language === 'bn' ? 'জোহর' : 'Dhuhr'}</th>
              <th className="p-4">{language === 'bn' ? 'আসর' : 'Asr'}</th>
              <th className="p-4">{language === 'bn' ? 'মাগরিব' : 'Maghrib'}</th>
              <th className="p-4">{language === 'bn' ? 'এশা' : 'Isha'}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ramadanDays.map((day, idx) => {
              const isToday = day.date.gregorian.date === format(new Date(), 'dd-MM-yyyy');
              return (
                <tr key={idx} className={`border-t border-emerald-100 dark:border-white/5 transition-colors ${isToday ? 'bg-emerald-500/10 dark:bg-amber-500/10' : 'hover:bg-emerald-50/50 dark:hover:bg-white/5'}`}>
                  <td className="p-4 font-bold text-emerald-700 dark:text-amber-400 sticky left-0 bg-inherit z-10">
                    {language === 'bn' ? toBengaliNumber(idx + 1) : idx + 1}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-stone-800 dark:text-emerald-50">
                      {language === 'bn' ? toBengaliNumber(day.date.gregorian.day) : day.date.gregorian.day}
                    </div>
                    <div className="text-[10px] opacity-40 font-bold uppercase text-stone-500 dark:text-emerald-200/60">
                      {language === 'bn' ? day.date.gregorian.month.en : day.date.gregorian.month.en}
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400/80 cursor-pointer hover:bg-emerald-500/10" onClick={() => onPrayerClick({ label: language === 'bn' ? 'ফজর' : 'Fajr', time: day.timings.Fajr, icon: <Moon /> })}>
                    {formatTime(day.timings.Fajr, language)}
                  </td>
                  <td className="p-4 font-mono font-bold text-stone-600 dark:text-emerald-100/60 cursor-pointer hover:bg-emerald-500/10" onClick={() => onPrayerClick({ label: language === 'bn' ? 'জোহর' : 'Dhuhr', time: day.timings.Dhuhr, icon: <Sun /> })}>
                    {formatTime(day.timings.Dhuhr, language)}
                  </td>
                  <td className="p-4 font-mono font-bold text-stone-600 dark:text-emerald-100/60 cursor-pointer hover:bg-emerald-500/10" onClick={() => onPrayerClick({ label: language === 'bn' ? 'আসর' : 'Asr', time: day.timings.Asr, icon: <Sun /> })}>
                    {formatTime(day.timings.Asr, language)}
                  </td>
                  <td className="p-4 font-mono font-bold text-orange-600 dark:text-orange-400/80 cursor-pointer hover:bg-emerald-500/10" onClick={() => onPrayerClick({ label: language === 'bn' ? 'মাগরিব (ইফতার)' : 'Maghrib (Iftar)', time: day.timings.Maghrib, icon: <Moon /> })}>
                    {formatTime(day.timings.Maghrib, language)}
                  </td>
                  <td className="p-4 font-mono font-bold text-stone-600 dark:text-emerald-100/60 cursor-pointer hover:bg-emerald-500/10" onClick={() => onPrayerClick({ label: language === 'bn' ? 'এশা' : 'Isha', time: day.timings.Isha || day.timings.Ishaa, icon: <Moon /> })}>
                    {formatTime(day.timings.Isha || day.timings.Ishaa, language)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DuaView: React.FC = () => {
  const { language, district } = useApp();
  const qiblaAngle = calculateQibla(district.lat, district.lng);
  
  const duas = [
    {
      titleBn: 'ইফতারের দোয়া',
      titleEn: 'Dua for Iftar',
      arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
      transBn: 'জাহাবাজ জামাউ ওয়াবতাল্লাতিল উরুকু ওয়া সাবাতাল আজরু ইনশাআল্লাহ।',
      transEn: 'Dhahabadh-dhama’u wabtallatil-‘uruqu, wa thabatal-ajru in sha’ Allah.',
      meaningBn: 'পিপাসা মিটেছে, শিরাগুলো সিক্ত হয়েছে এবং ইনশাআল্লাহ সওয়াব নির্ধারিত হয়েছে।',
      meaningEn: 'The thirst is gone, the veins are moistened and the reward is confirmed, if Allah wills.'
    },
    {
      titleBn: 'রোজার নিয়ত',
      titleEn: 'Intention for Fasting',
      arabic: 'نَوَيْتُ اَنْ اَصُوْمَ غَدًا مِّনْ শَهْرِ رَمْضَانَ الْمُবিারাকি ফারদ্বাল্লাকা ইয়া আল্লাহু ফাতাক্বাব্বাল মিন্নী ইন্নাকা আনতাস সামীউল আলীম।',
      transBn: 'নাওয়াইতু আন আসুমা গাদাম মিন শাহরি রামাদ্বানাল মুবারাকি ফারদ্বাল্লাকা ইয়া আল্লাহু ফাতাক্বাব্বাল মিন্নী ইন্নাকা আনতাস সামীউল আলীম।',
      transEn: 'Nawaitu an asuma ghadan min shahri ramadanal mubaraki fardal laka ya Allahu fataqabbal minni innaka antas samiul alim.',
      meaningBn: 'হে আল্লাহ! আগামীকাল পবিত্র রমজান মাসে তোমার পক্ষ থেকে নির্ধারিত ফরজ রোজা রাখার নিয়ত করলাম। অতএব তুমি আমার পক্ষ থেকে তা কবুল কর। নিশ্চয়ই তুমি সর্বশ্রোতা ও সর্বজ্ঞ।',
      meaningEn: 'I intend to fast tomorrow for the month of Ramadan for your sake, O Allah, so accept it from me. Indeed, You are the All-Hearing, the All-Knowing.'
    }
  ];

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold mb-4 neon-text">
        {language === 'bn' ? 'দোয়া ও কিবলা' : 'Duas & Qibla'}
      </h2>

      {/* Qibla Card */}
      <div className="glass-panel p-6 flex items-center justify-between mb-6 group">
        <div>
          <h3 className="font-bold text-emerald-700 dark:text-amber-400">{language === 'bn' ? 'কিবলা দিক' : 'Qibla Direction'}</h3>
          <p className="text-xs opacity-60 font-mono text-emerald-900 dark:text-emerald-100">
            {language === 'bn' ? `উত্তর থেকে ${toBengaliNumber(qiblaAngle.toFixed(1))}° ডিগ্রি` : `${qiblaAngle.toFixed(1)}° from North`}
          </p>
        </div>
        <div className="relative w-20 h-20 flex items-center justify-center bg-emerald-500/5 dark:bg-white/5 rounded-full border border-emerald-100 dark:border-white/5 shadow-inner">
          <Compass size={32} className="opacity-10 text-emerald-900 dark:text-white" />
          <motion.div 
            animate={{ rotate: qiblaAngle }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-1 h-10 bg-emerald-600 dark:bg-amber-500 rounded-full -translate-y-3 shadow-[0_0_10px_rgba(16,185,129,0.8)] dark:shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </motion.div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-30 text-emerald-900 dark:text-white">N</div>
        </div>
      </div>

      {duas.map((dua, idx) => (
        <div key={idx} className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold border-b border-emerald-100 dark:border-white/5 pb-3 text-emerald-700 dark:text-amber-400">
            {language === 'bn' ? dua.titleBn : dua.titleEn}
          </h3>
          <p className="text-2xl text-right font-serif leading-loose text-emerald-950 dark:text-slate-100" dir="rtl">
            {dua.arabic}
          </p>
          <div className="space-y-3 text-sm">
            <p className="italic opacity-60 leading-relaxed text-emerald-800 dark:text-slate-400">
              {language === 'bn' ? dua.transBn : dua.transEn}
            </p>
            <p className="font-medium text-emerald-900 dark:text-slate-300">
              {language === 'bn' ? dua.meaningBn : dua.meaningEn}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const SettingsView: React.FC = () => {
  const { language, theme, setLanguage, toggleTheme } = useApp();
  
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold mb-4 neon-text">
        {language === 'bn' ? 'সেটিংস' : 'Settings'}
      </h2>
      
      <div className="glass-panel divide-y divide-slate-100 dark:divide-white/5">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{language === 'bn' ? 'ভাষা' : 'Language'}</h3>
            <p className="text-xs opacity-50 text-slate-600 dark:text-slate-400">{language === 'bn' ? 'অ্যাপের ভাষা পরিবর্তন করুন' : 'Change app language'}</p>
          </div>
          <div className="flex bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-1 border border-emerald-100 dark:border-emerald-500/10">
            <button 
              onClick={() => setLanguage('bn')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'bn' ? 'bg-emerald-700 dark:bg-amber-500 text-white dark:text-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'opacity-50 text-emerald-700 dark:text-emerald-400'}`}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-emerald-700 dark:bg-amber-500 text-white dark:text-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'opacity-50 text-emerald-700 dark:text-emerald-400'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-stone-800 dark:text-emerald-50">{language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</h3>
            <p className="text-xs opacity-50 text-stone-600 dark:text-emerald-200/60">{language === 'bn' ? 'চোখের আরামের জন্য' : 'For eye comfort'}</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-all ${theme === 'dark' ? 'bg-amber-500' : 'bg-stone-200 dark:bg-emerald-900/40'}`}
          >
            <motion.div 
              animate={{ x: theme === 'dark' ? 26 : 4 }}
              className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm ${theme === 'dark' ? 'bg-emerald-950' : 'bg-white'}`}
            />
          </button>
        </div>

        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-stone-800 dark:text-emerald-50">{language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</h3>
            <p className="text-xs opacity-50 text-stone-600 dark:text-emerald-200/60">{language === 'bn' ? 'সেহরি ও ইফতারের ১৫ মিনিট আগে' : '15 mins before Sehri & Iftar'}</p>
          </div>
          <button className="p-2.5 rounded-xl bg-stone-100 dark:bg-emerald-900/20 border border-stone-200 dark:border-emerald-500/10 text-emerald-700 dark:text-amber-400">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="text-center opacity-20 text-[10px] uppercase tracking-[0.5em] font-bold">
        Ramadan Time BD v1.0.0
      </div>
    </div>
  );
};

export default MainScreen;
