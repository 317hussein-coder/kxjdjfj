import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { UltraVideoPlayer } from './components/video/UltraVideoPlayer';
import { AiChatHub } from './components/ai/AiChatHub';
import { ArcadeZone } from './components/games/ArcadeZone';
import { ProductivitySuite } from './components/productivity/ProductivitySuite';
import { ZenWellnessZone } from './components/wellness/ZenWellnessZone';
import { FeatureMatrix } from './components/directory/FeatureMatrix';
import { QuickToolModal } from './components/quicktools/QuickToolModal';
import { AppTab, FeatureItem } from './types';
import { ALL_FEATURES } from './data/featuresData';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('video');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('superhub_sound') !== 'false';
  });

  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
    localStorage.setItem('superhub_sound', soundEnabled.toString());
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Global Hotkey for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundManager.playClick(700);
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectFeature = (feature: FeatureItem) => {
    if (feature.category === 'video') {
      setCurrentTab('video');
    } else if (feature.category === 'ai') {
      setCurrentTab('ai');
    } else if (feature.category === 'arcade') {
      setCurrentTab('arcade');
    } else if (feature.category === 'wellness') {
      setCurrentTab('wellness');
    } else if (feature.category === 'productivity' || feature.category === 'calculators' || feature.category === 'developer' || feature.category === 'knowledge') {
      setCurrentTab('productivity');
    } else {
      setSelectedFeature(feature);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* Top Fixed Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        featuresCount={ALL_FEATURES.length}
      />

      {/* Main App Content View with Fluid Transitions */}
      <main className="flex-1 pb-16">
        {currentTab === 'video' && <UltraVideoPlayer />}
        {currentTab === 'ai' && <AiChatHub />}
        {currentTab === 'arcade' && <ArcadeZone />}
        {currentTab === 'productivity' && <ProductivitySuite />}
        {currentTab === 'wellness' && <ZenWellnessZone />}
        {currentTab === 'matrix' && (
          <FeatureMatrix
            onSelectFeature={handleSelectFeature}
            onNavigateTab={setCurrentTab}
          />
        )}
      </main>

      {/* Command Palette Modal (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectFeature={handleSelectFeature}
        onNavigateTab={setCurrentTab}
      />

      {/* Feature Details Modal */}
      <QuickToolModal
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onNavigateTab={setCurrentTab}
      />

      {/* Subtle Bottom Footer */}
      <footer className="w-full border-t border-white/5 bg-black/40 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-gray-400">SuperHub 360</span>
            <span>• {ALL_FEATURES.length}+ ميزة مفعّلة وفائقة السلاسة</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button onClick={() => setCurrentTab('matrix')} className="hover:text-white transition">
              دليل الميزات
            </button>
            <button onClick={() => setCurrentTab('video')} className="hover:text-white transition">
              مشغل الفيديو
            </button>
            <button onClick={() => setCurrentTab('ai')} className="hover:text-white transition">
              المساعد الذكي (Gemini)
            </button>
            <button onClick={() => setIsCommandPaletteOpen(true)} className="hover:text-white transition">
              البحث الفوري (⌘K)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
