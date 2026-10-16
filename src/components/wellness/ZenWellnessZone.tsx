import React, { useState, useEffect, useRef } from 'react';
import { 
  Circle, 
  CloudRain, 
  Flame, 
  Wind, 
  Coffee, 
  Radio, 
  Music, 
  Grid, 
  Sparkles, 
  Droplet, 
  Eye, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  Heart
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

type ActiveZenTab = 'breathing' | 'soundscapes' | 'bubbles' | 'particles' | 'water' | 'eyecare';

export const ZenWellnessZone: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveZenTab>('breathing');

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      
      {/* Tab Switcher */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'breathing', label: 'تمارين التنفس والسكينة', icon: <Circle className="w-4 h-4" /> },
          { id: 'soundscapes', label: 'مازج الأصوات المحيطية (Rain & Fire)', icon: <CloudRain className="w-4 h-4" /> },
          { id: 'bubbles', label: 'مفرقع الفقاعات اللانهائي', icon: <Grid className="w-4 h-4" /> },
          { id: 'particles', label: 'حديقة الجسيمات التفاعلية', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'water', label: 'مسجل شرب الماء اليومي', icon: <Droplet className="w-4 h-4" /> },
          { id: 'eyecare', label: 'مؤقت حماية العين 20-20-20', icon: <Eye className="w-4 h-4" /> },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playClick(isActive ? 600 : 750);
                setActiveTab(t.id as ActiveZenTab);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white border-teal-400 shadow-md shadow-teal-500/25'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 min-h-[500px]">
        {activeTab === 'breathing' && <ZenBreathing />}
        {activeTab === 'soundscapes' && <ZenSoundscapes />}
        {activeTab === 'bubbles' && <ZenBubbleWrap />}
        {activeTab === 'particles' && <ZenParticles />}
        {activeTab === 'water' && <ZenWaterTracker />}
        {activeTab === 'eyecare' && <ZenEyeCare />}
      </div>

    </div>
  );
};

// ==========================================
// 1. ZEN: BOX BREATHING 4-7-8
// ==========================================
const ZenBreathing: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [seconds, setSeconds] = useState<number>(4);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            soundManager.playClick(500);
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            soundManager.playClick(400);
            return 8;
          } else if (phase === 'exhale') {
            setPhase('inhale');
            soundManager.playClick(600);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const phaseConfig = {
    inhale: { label: 'شهيق عميق من الأنف...', color: 'from-cyan-500 to-teal-500', scale: 'scale-125' },
    hold: { label: 'احبس الهواء بهدوء...', color: 'from-teal-500 to-indigo-500', scale: 'scale-125' },
    exhale: { label: 'زفير بطيء ومريح من الفم...', color: 'from-indigo-500 to-purple-500', scale: 'scale-90' },
    pause: { label: 'استعد للبدء...', color: 'from-gray-500 to-gray-700', scale: 'scale-100' },
  };

  const current = phaseConfig[phase];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center py-6">
      <div>
        <h3 className="text-xl font-black text-white">تمرين التنفس المهدئ (تقنية 4-7-8)</h3>
        <p className="text-xs text-gray-400">تساعد على خفض نبضات القلب وإزالة التوتر في دقيقتين</p>
      </div>

      {/* Breathing Ring with smooth CSS transition */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-tr ${current.color} opacity-40 blur-2xl transition-all duration-1000 ${current.scale}`}
        />
        <div
          className={`absolute w-44 h-44 rounded-full border-2 border-white/30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-1000 ${current.scale}`}
        >
          <span className="text-4xl font-mono font-black text-white">{seconds}s</span>
          <span className="text-xs font-bold text-teal-200 mt-1 max-w-[120px] leading-tight">
            {current.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick(700);
            setIsActive(!isActive);
          }}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition flex items-center gap-2"
        >
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isActive ? 'إيقاف التمرين مؤقتاً' : 'استئناف التنفس'}</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. ZEN: AMBIENT SOUNDSCAPES MIXER
// ==========================================
const ZenSoundscapes: React.FC = () => {
  const [tracks, setTracks] = useState<Record<string, number>>({
    rain: 0,
    waves: 0,
    fire: 0,
    whitenoise: 0,
    zen432: 0,
  });

  const soundList = [
    { id: 'rain', label: 'مطر هادئ على النافذة', icon: <CloudRain className="w-4 h-4 text-cyan-400" /> },
    { id: 'waves', label: 'أمواج شاطئ البحر الهادئة', icon: <Wind className="w-4 h-4 text-blue-400" /> },
    { id: 'fire', label: 'فرقعة حطب الموقد الدافئ', icon: <Flame className="w-4 h-4 text-amber-400" /> },
    { id: 'whitenoise', label: 'الضوضاء البيضاء للتركيز', icon: <Radio className="w-4 h-4 text-purple-400" /> },
    { id: 'zen432', label: 'تردد السكينة 432Hz Zen', icon: <Music className="w-4 h-4 text-emerald-400" /> },
  ];

  const handleVolumeChange = (id: string, vol: number) => {
    setTracks(prev => ({ ...prev, [id]: vol }));
    soundManager.toggleAmbientSound(id, vol);
  };

  const stopAll = () => {
    soundManager.stopAllAmbience();
    setTracks({
      rain: 0,
      waves: 0,
      fire: 0,
      whitenoise: 0,
      zen432: 0,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">استوديو الأصوات المحيطية الطبيعية</h3>
          <p className="text-xs text-gray-400">اصنع جوك المفضل للمذاكرة والنوم والهدوء (توليد مباشر بدون إنترنت)</p>
        </div>
        <button
          onClick={stopAll}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-gray-300 hover:text-white"
        >
          كتم الكل
        </button>
      </div>

      <div className="space-y-3">
        {soundList.map(s => {
          const currentVol = tracks[s.id] || 0;
          return (
            <div
              key={s.id}
              className="p-4 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  {s.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{s.label}</span>
                  <span className="text-[10px] text-gray-400">
                    {currentVol > 0 ? `مستوى الصوت: ${Math.round(currentVol * 100)}%` : 'صامت'}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentVol}
                onChange={e => handleVolumeChange(s.id, parseFloat(e.target.value))}
                className="w-32 sm:w-44 accent-teal-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. ZEN: INFINITE BUBBLE WRAP
// ==========================================
const ZenBubbleWrap: React.FC = () => {
  const [bubbles, setBubbles] = useState<boolean[]>(() => Array(48).fill(false));
  const [poppedCount, setPoppedCount] = useState<number>(0);

  const popBubble = (index: number) => {
    if (bubbles[index]) return;
    soundManager.playPop();
    const newBubbles = [...bubbles];
    newBubbles[index] = true;
    setBubbles(newBubbles);
    setPoppedCount(c => c + 1);
  };

  const resetAll = () => {
    soundManager.playSuccess();
    setBubbles(Array(48).fill(false));
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto text-center">
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-xl font-black text-white">مفرقع الفقاعات البلاستيكية</h3>
          <p className="text-xs text-gray-400">فرقع للتخلص من أي توتر وضغط بصوت مريح</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-teal-300 bg-white/5 px-2.5 py-1 rounded-xl">
            المفرقعة: {poppedCount}
          </span>
          <button
            onClick={resetAll}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="إعادة تعبئة الفقاعات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 p-4 bg-black/60 rounded-3xl border border-white/10 shadow-2xl">
        {bubbles.map((popped, idx) => (
          <button
            key={idx}
            onClick={() => popBubble(idx)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-100 flex items-center justify-center select-none ${
              popped
                ? 'bg-black/30 border border-white/5 scale-90 opacity-40 shadow-inner'
                : 'bg-gradient-to-tr from-cyan-500/30 to-indigo-500/40 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-75'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${popped ? 'bg-transparent' : 'bg-white/80'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. ZEN: INTERACTIVE PARTICLE GARDEN
// ==========================================
const ZenParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
    const colors = ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#14b8a6'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handlePointerMove);

    const render = () => {
      ctx.fillStyle = 'rgba(8, 10, 18, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        // Attract lightly to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += (dx / dist) * 0.8;
          p.y += (dy / dist) * 0.8;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${1 - d / 80})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto text-center">
      <div>
        <h3 className="text-xl font-black text-white">حديقة الجسيمات التفاعلية</h3>
        <p className="text-xs text-gray-400">حرك المؤشر عبر الشاشة لصنع موجات وخطوط مغناطيسية مهدئة</p>
      </div>

      <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-auto bg-[#080a12] block cursor-crosshair"
        />
      </div>
    </div>
  );
};

// ==========================================
// 5. ZEN: WATER INTAKE TRACKER
// ==========================================
const ZenWaterTracker: React.FC = () => {
  const [glasses, setGlasses] = useState<number>(() => {
    return parseInt(localStorage.getItem('superhub_water') || '4', 10);
  });
  const goal = 8; // 8 glasses (approx 2 Liters)

  const addGlass = () => {
    soundManager.playPop();
    const next = Math.min(16, glasses + 1);
    setGlasses(next);
    localStorage.setItem('superhub_water', next.toString());
  };

  const removeGlass = () => {
    soundManager.playClick(400);
    const next = Math.max(0, glasses - 1);
    setGlasses(next);
    localStorage.setItem('superhub_water', next.toString());
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div>
        <h3 className="text-xl font-black text-white">مسجل شرب الماء اليومي</h3>
        <p className="text-xs text-gray-400">الهدف اليومي: 8 أكواب (2 لتر) للحفاظ على نشاط الدماغ وصحة الجسم</p>
      </div>

      <div className="p-6 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center space-y-4">
        {/* Visual Water Bottle */}
        <div className="relative w-28 h-52 rounded-b-3xl rounded-t-xl border-4 border-cyan-400/50 bg-black/40 overflow-hidden flex flex-col justify-end p-1 shadow-2xl shadow-cyan-500/20">
          <div
            className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 rounded-b-2xl transition-all duration-500 flex items-center justify-center font-bold text-white text-xs"
            style={{ height: `${Math.min(100, (glasses / goal) * 100)}%` }}
          >
            {Math.round((glasses / goal) * 100)}%
          </div>
        </div>

        <div className="text-2xl font-mono font-black text-white">
          {glasses} / {goal} أكواب
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={removeGlass}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
          >
            - إنقاص
          </button>
          <button
            onClick={addGlass}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-500/25 active:scale-95 transition"
          >
            + شربت كوباً 💧
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. ZEN: 20-20-20 EYE STRAIN TIMER
// ==========================================
const ZenEyeCare: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 mins
  const [isResting, setIsResting] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          soundManager.playBell();
          setIsResting(true);
          return 20; // 20s rest
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div>
        <h3 className="text-xl font-black text-white">قاعدة 20-20-20 لحماية العين من الشاشات</h3>
        <p className="text-xs text-gray-400">كل 20 دقيقة، انظر إلى شيء يبعد 20 قدماً (6 أمتار) لمدة 20 ثانية</p>
      </div>

      <div className="p-8 bg-black/40 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
          <Eye className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-xs text-gray-400 block mb-1">
            {isResting ? 'وقت استراحة النظر الآن! 👁️' : 'الوقت المتبقي للاستراحة القادمة:'}
          </span>
          <span className="text-4xl font-mono font-black text-white">
            {isResting ? `${secs}s` : `${mins}:${secs.toString().padStart(2, '0')}`}
          </span>
        </div>

        <p className="text-xs text-teal-200">
          {isResting
            ? 'انظر الآن عبر النافذة أو إلى أبعد نقطة في الغرفة ليرتاح بؤبؤ العين.'
            : 'استمر في عملك، وسنقوم بتنبيهك عند اكتمال الـ 20 دقيقة تلقائياً.'}
        </p>
      </div>
    </div>
  );
};
