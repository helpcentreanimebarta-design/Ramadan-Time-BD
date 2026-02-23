import React, { useState, useEffect } from 'react';
import { quranSurahs, Surah } from '../data/quran';
import { useApp } from '../context/AppContext';
import { toBengaliNumber } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, BookOpen, Search } from 'lucide-react';
import axios from 'axios';

const QuranView: React.FC = () => {
  const { language } = useApp();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahContent, setSurahContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = quranSurahs.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  const fetchSurah = async (number: number) => {
    setLoading(true);
    try {
      // Fetching Uthmani script, Bengali translation, and English translation
      const response = await axios.get(`https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,bn.bengali,en.sahih`);
      setSurahContent(response.data.data);
    } catch (error) {
      console.error('Error fetching surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    fetchSurah(surah.number);
  };

  return (
    <div className="space-y-6 pt-6 pb-12">
      <AnimatePresence mode="wait">
        {!selectedSurah ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold neon-text">
                {language === 'bn' ? 'পবিত্র কুরআন' : 'Holy Quran'}
              </h2>
              <div className="text-xs opacity-50 font-bold uppercase tracking-widest text-emerald-700 dark:text-amber-400">
                {language === 'bn' ? '৩০টি সূরা' : '30 Surahs'}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
              <input 
                type="text"
                placeholder={language === 'bn' ? 'সূরা খুঁজুন...' : 'Search Surah...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/60 border border-emerald-100 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm text-emerald-900 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => handleSurahClick(surah)}
                  className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-emerald-100 dark:border-white/5 rounded-3xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-amber-400 font-mono font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {surah.number}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-emerald-950 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors">
                        {surah.englishName}
                      </h3>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold text-emerald-800 dark:text-emerald-400">
                        {surah.revelationType === 'Meccan' ? (language === 'bn' ? 'মক্কী' : 'Meccan') : (language === 'bn' ? 'মাদানী' : 'Madinan')} • {language === 'bn' ? toBengaliNumber(surah.numberOfAyahs) : surah.numberOfAyahs} {language === 'bn' ? 'আয়াত' : 'Ayahs'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xl font-serif text-right text-emerald-700 dark:text-amber-400/80" dir="rtl">
                    {surah.name}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-2 text-sm text-emerald-700/60 dark:text-amber-400/60 hover:text-emerald-700 dark:hover:text-amber-400 transition-colors mb-4 font-bold"
            >
              <ChevronLeft size={18} />
              {language === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to List'}
            </button>

            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-emerald-500/20 dark:border-amber-500/20 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/10 dark:shadow-amber-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10 dark:bg-amber-500/10">
                {loading && (
                  <motion.div 
                    className="h-full bg-emerald-500 dark:bg-amber-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] dark:shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ width: '30%' }}
                  />
                )}
              </div>
              
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-amber-500/10 border border-emerald-500/20 dark:border-amber-500/20 text-emerald-700 dark:text-amber-400 font-mono font-bold mb-4">
                {selectedSurah.number}
              </div>
              
              <h2 className="text-4xl font-serif font-bold mb-2 neon-text">{selectedSurah.name}</h2>
              <p className="text-lg font-bold text-emerald-950 dark:text-slate-100 mb-4">{selectedSurah.englishName}</p>
              
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-100 dark:border-white/5 flex flex-col items-center min-w-[80px]">
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 text-emerald-900 dark:text-emerald-100">
                    {language === 'bn' ? 'অবতরণ' : 'Revelation'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-amber-400">
                    {selectedSurah.revelationType === 'Meccan' ? (language === 'bn' ? 'মক্কী' : 'Meccan') : (language === 'bn' ? 'মাদানী' : 'Madinan')}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-100 dark:border-white/5 flex flex-col items-center min-w-[80px]">
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 text-emerald-900 dark:text-emerald-100">
                    {language === 'bn' ? 'আয়াত' : 'Ayahs'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-amber-400">
                    {language === 'bn' ? toBengaliNumber(selectedSurah.numberOfAyahs) : selectedSurah.numberOfAyahs}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 dark:border-amber-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 dark:border-amber-500 animate-spin"></div>
                </div>
              </div>
            ) : (surahContent && surahContent.length >= 3) && (
              <div className="space-y-6">
                {surahContent[0].ayahs.map((ayah: any, idx: number) => (
                  <div key={ayah.number} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-emerald-100 dark:border-white/5 rounded-[2rem] p-6 space-y-6 hover:border-emerald-500/20 dark:hover:border-amber-500/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="px-3 py-1 rounded-lg bg-emerald-500/10 dark:bg-amber-500/10 flex items-center justify-center text-[10px] font-mono text-emerald-700 dark:text-amber-400 font-bold border border-emerald-500/20 dark:border-amber-500/20">
                        {ayah.numberInSurah}
                      </div>
                      <BookOpen size={14} className="opacity-20 text-emerald-600 dark:text-amber-400" />
                    </div>
                    
                    <p className="text-3xl text-right font-serif leading-loose text-emerald-950 dark:text-slate-100" dir="rtl">
                      {ayah.text}
                    </p>
                    
                    <div className="space-y-4 pt-4 border-t border-emerald-100 dark:border-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50">
                          {language === 'bn' ? 'অনুবাদ' : 'Bengali'}
                        </span>
                        <p className="text-base font-medium leading-relaxed text-emerald-900 dark:text-emerald-100">
                          {surahContent[1].ayahs[idx].text}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/30">
                          English
                        </span>
                        <p className="text-xs opacity-60 leading-relaxed text-emerald-900 dark:text-slate-300 italic">
                          {surahContent[2].ayahs[idx].text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuranView;
