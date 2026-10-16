import React from 'react';
import { 
  PlayCircle, 
  Bot, 
  Gamepad2, 
  Briefcase, 
  Feather, 
  Layers, 
  Search, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles,
  Zap
} from 'lucide-react';
import { AppTab } from '../types';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenCommandPalette: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  featuresCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCommandPalette,
  soundEnabled,
  onToggleSound,
  featuresCount,
}) => {
  const toggleFullscreen = () => {
    soundManager.playClick(700);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'video', label: 'مشغل الفيديو', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'ai', label: 'المساعد الذكي (AI)', icon: <Bot className="w-4 h-4" />, badge: 'Gemini' },
    { id: 'arcade', label: 'ألعاب وترفيه', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'productivity', label: 'أدوات وإنتاجية', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'wellness', label: 'الراحة والزن', icon: <Feather className="w-4 h-4" /> },
    { id: 'matrix', label: 'دليل الـ 354+ ميزة', icon: <Layers className="w-4 h-4" />, badge: `${featuresCount}+` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => {
            soundManager.playClick(800);
            onSelectTab('matrix');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 opacity-40 blur group-hover:opacity-75 transition duration-300 -z-10" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                SuperHub 360
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {featuresCount}+ ميزة
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium -mt-1 hidden sm:block">
              المنصة المتكاملة فائقة السلاسة
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/5">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick(isActive ? 600 : 750);
                  onSelectTab(item.id);
                }}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-indigo-600/90 shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Search / Command Palette Button */}
          <button
            onClick={() => {
              soundManager.playClick(650);
              onOpenCommandPalette();
            }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-all group"
            title="ابحث في 354+ ميزة (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">ابحث في 354+ ميزة...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-gray-400 bg-black/40 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick(soundEnabled ? 400 : 800);
            }}
            className={`p-2 rounded-xl border text-xs transition-all ${
              soundEnabled
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
            title={soundEnabled ? 'كتم مؤثرات الصوت' : 'تفعيل مؤثرات الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs transition-all hidden sm:block"
            title="ملء الشاشة"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Nav Bar */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/40">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick(isActive ? 600 : 750);
                onSelectTab(item.id);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'text-white bg-indigo-600 shadow-sm border border-indigo-400/40'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1 rounded bg-black/30 text-indigo-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
