import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Layers } from 'lucide-react';
import { ALL_FEATURES, CATEGORIES_META } from '../data/featuresData';
import { FeatureItem, AppTab } from '../types';
import { soundManager } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (feature: FeatureItem) => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredFeatures = ALL_FEATURES.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesText = 
      item.title.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesText;
  }).slice(0, 40); // limit to top 40 for max fluid rendering

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundManager.playClick(500);
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredFeatures.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundManager.playClick(550);
      setSelectedIndex(prev => (prev - 1 + filteredFeatures.length) % Math.max(1, filteredFeatures.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredFeatures[selectedIndex];
      if (current) {
        soundManager.playClick(800);
        onSelectFeature(current);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0f121d] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-black/40">
          <Search className="w-5 h-5 text-indigo-400 ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث بين 354+ ميزة، أداة، لعبة، أو مشغل الفيديو..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
            dir="auto"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400 mr-2 border border-white/10 px-2 py-0.5 rounded bg-white/5">
            Esc للإغلاق
          </span>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          {Object.entries(CATEGORIES_META).map(([key, meta]) => {
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => {
                  soundManager.playClick(600);
                  setSelectedCategory(key);
                  setSelectedIndex(0);
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {meta.labelAr} ({meta.count})
              </button>
            );
          })}
        </div>

        {/* Feature List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.03]">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Layers className="w-10 h-10 mx-auto text-gray-600 mb-2" />
              <p className="text-sm font-semibold">لم يتم العثور على ميزة مطابقة لـ "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">جرب كلمات أخرى مثل: فيديو، ذكاء، حاسبة، لعبة، بومودورو</p>
            </div>
          ) : (
            filteredFeatures.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundManager.playClick(800);
                    onSelectFeature(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-400'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate text-white">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                    <span className="text-[10px] text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 hidden sm:inline">
                      {CATEGORIES_META[item.category]?.labelAr}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-300 font-semibold">
                        فتح <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>استخدم <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↓</kbd> للتنقل</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">Enter</kbd> للاختيار والتنفيذ</span>
          </div>
          <span className="text-indigo-400 font-bold">
            {ALL_FEATURES.length}+ ميزة مفعلة وجاهزة
          </span>
        </div>
      </div>
    </div>
  );
};
