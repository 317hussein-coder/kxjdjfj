import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Star, 
  Layers, 
  SlidersHorizontal, 
  ExternalLink, 
  PlayCircle, 
  Bot, 
  Gamepad2, 
  Briefcase, 
  Feather, 
  BookOpen, 
  Percent, 
  Terminal,
  CheckCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { ALL_FEATURES, CATEGORIES_META } from '../../data/featuresData';
import { FeatureItem, AppTab } from '../../types';
import { soundManager } from '../../utils/audio';

interface FeatureMatrixProps {
  onSelectFeature: (feature: FeatureItem) => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({
  onSelectFeature,
  onNavigateTab,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('superhub_favs');
    return saved ? JSON.parse(saved) : ['v-player-main', 'ai-chat-master', 'g-2048', 'p-pomodoro', 'z-sound-rain'];
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('superhub_favs', JSON.stringify(next));
      return next;
    });
  };

  const filteredFeatures = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_FEATURES.filter(item => {
      const matchesCat = selectedCat === 'all' || item.category === selectedCat;
      if (!q) return matchesCat;
      const matchesText =
        item.title.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesText;
    });
  }, [search, selectedCat]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>أكثر من 354 ميزة تفاعلية وسلسة</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                الإصدار الفائق 360
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              دليل ومصفوفة الـ 365+ ميزة المتكاملة
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              كل ما تحتاجه للترفيه والعمل والراحة في تطبيق واحد فائق السلاسة. تصفح الميزات، استخدم البحث الفوري، أو شغّل أي أداة بنقرة واحدة!
            </p>
          </div>

          {/* Quick Counter Card */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 font-black text-2xl font-mono">
              365
            </div>
            <div>
              <span className="text-sm font-black text-white block">ميزة جاهزة</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                سلاسة 60fps كاملة
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الوصف في 365 ميزة (مثل: فيديو، ذكاء، حاسبة، لعبة، بومودورو)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl pr-11 pl-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 shadow-inner"
              dir="auto"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {Object.entries(CATEGORIES_META).map(([key, meta]) => {
          const isSelected = selectedCat === key;
          return (
            <button
              key={key}
              onClick={() => {
                soundManager.playClick(600);
                setSelectedCat(key);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{meta.labelAr}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-white/25 text-white' : 'bg-black/40 text-gray-400'
              }`}>
                {meta.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFeatures.map(item => {
          const isFav = favorites.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => {
                soundManager.playClick(750);
                onSelectFeature(item);
              }}
              className="glass-card p-4 rounded-2xl border border-white/5 hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/5 text-gray-400 border border-white/5">
                      {CATEGORIES_META[item.category]?.labelAr || item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={e => toggleFavorite(item.id, e)}
                    className="p-1 rounded-lg text-gray-500 hover:text-yellow-400 transition"
                    title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-500">
                <span className="font-mono text-[10px] text-gray-500">{item.titleEn}</span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-[-2px] transition-transform">
                  تشغيل <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-16 text-gray-400 glass-panel rounded-3xl p-8 border border-white/10">
          <Layers className="w-12 h-12 mx-auto text-gray-600 mb-2" />
          <p className="text-base font-bold text-white">لم يتم العثور على ميزة مطابقة</p>
          <p className="text-xs text-gray-500 mt-1">جرب مسح البحث أو اختيار قسم مختلف.</p>
        </div>
      )}

    </div>
  );
};
