import React from 'react';
import { X, Sparkles, ExternalLink, ArrowRight, CheckCircle, Copy } from 'lucide-react';
import { FeatureItem, AppTab } from '../../types';
import { soundManager } from '../../utils/audio';

interface QuickToolModalProps {
  feature: FeatureItem | null;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const QuickToolModal: React.FC<QuickToolModalProps> = ({
  feature,
  onClose,
  onNavigateTab,
}) => {
  if (!feature) return null;

  const handleLaunchMain = () => {
    soundManager.playClick(800);
    if (feature.category === 'video') {
      onNavigateTab('video');
    } else if (feature.category === 'ai') {
      onNavigateTab('ai');
    } else if (feature.category === 'arcade') {
      onNavigateTab('arcade');
    } else if (feature.category === 'wellness') {
      onNavigateTab('wellness');
    } else {
      onNavigateTab('productivity');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0f121d] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{feature.title}</h3>
                {feature.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {feature.badge}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{feature.titleEn}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-xs font-bold text-indigo-300 block">وصف وإمكانيات الميزة:</span>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            {feature.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {feature.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-black/40 text-gray-400 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleLaunchMain}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>الانتقال والتفعيل في القسم الرئيسي</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
