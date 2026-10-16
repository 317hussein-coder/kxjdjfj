import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Camera, 
  Sliders, 
  Sparkles, 
  Bookmark, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Link as LinkIcon, 
  Gauge, 
  Repeat, 
  Layers, 
  ChevronRight,
  Film,
  Crop
} from 'lucide-react';
import { VideoTrack, VideoBookmark } from '../../types';
import { PRESET_VIDEOS } from '../../data/videoData';
import { soundManager } from '../../utils/audio';

type VideoFilterType = 'none' | 'cinematic' | 'cyberpunk' | 'vintage' | 'noir' | 'vibrant' | 'emerald' | 'invert';
type AspectRatioType = '16/9' | '4/3' | '21/9' | 'cover';

export const UltraVideoPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<VideoTrack>(PRESET_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [audioBoost, setAudioBoost] = useState<number>(1.0); // 1.0 to 2.0x gain
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeFilter, setActiveFilter] = useState<VideoFilterType>('none');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16/9');
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [bookmarkLabel, setBookmarkLabel] = useState<string>('');
  const [screenshotSuccess, setScreenshotSuccess] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Setup Web Audio booster
  const initAudioBooster = () => {
    if (!videoRef.current || audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(videoRef.current);
      const gain = ctx.createGain();
      gain.gain.value = audioBoost;
      source.connect(gain);
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
    } catch {
      // Audio already connected or CORS fallback
    }
  };

  const handleAudioBoostChange = (newBoost: number) => {
    soundManager.playClick(600);
    setAudioBoost(newBoost);
    initAudioBooster();
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newBoost;
    }
  };

  // Auto hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  // Video event handlers
  const togglePlay = useCallback(() => {
    soundManager.playClick(isPlaying ? 550 : 700);
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    soundManager.playClick(650);
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const stepFrame = (forward: boolean) => {
    soundManager.playClick(600);
    if (!videoRef.current) return;
    const step = 0.04; // 1 frame at 25-30fps
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + (forward ? step : -step)));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const takeScreenshot = () => {
    if (!videoRef.current) return;
    soundManager.playSuccess();
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1920;
      canvas.height = videoRef.current.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `superhub-frame-${Math.floor(currentTime)}s.png`;
        link.href = dataUrl;
        link.click();
        setScreenshotSuccess(true);
        setTimeout(() => setScreenshotSuccess(false), 2200);
      }
    } catch {
      // Cross-origin restriction fallback
      alert('تم حفظ الإطار، أو تعذر الحفظ بسبب سياسة الأمان للمصدر الخارجي.');
    }
  };

  const addBookmark = () => {
    soundManager.playClick(800);
    const label = bookmarkLabel.trim() || `لقطة عند ${formatTime(currentTime)}`;
    setBookmarks(prev => [
      ...prev,
      { id: Date.now().toString(), time: currentTime, label, createdAt: Date.now() }
    ]);
    setBookmarkLabel('');
  };

  const togglePiP = async () => {
    soundManager.playClick(750);
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const toggleFullscreen = () => {
    soundManager.playClick(800);
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Local File Upload Handler
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundManager.playSuccess();
    const fileUrl = URL.createObjectURL(file);
    const newTrack: VideoTrack = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'ملف محلي من جهازك',
      url: fileUrl,
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
      duration: '--:--',
      resolution: 'Local File',
      description: 'تم تحميل هذا الفيديو مباشرة من حاسوبك بسلاسة وسرعة فائقة بدون استهلاك إنترنت.',
    };
    setCurrentTrack(newTrack);
    setIsPlaying(false);
  };

  // Custom Stream URL Handler
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    soundManager.playSuccess();
    const newTrack: VideoTrack = {
      id: `custom-${Date.now()}`,
      title: 'بث مخصص من الرابط',
      category: 'رابط خارجي',
      url: customUrlInput.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      duration: '--:--',
      resolution: 'Stream Source',
      description: `رابط البث: ${customUrlInput.trim()}`,
    };
    setCurrentTrack(newTrack);
    setCustomUrlInput('');
    setIsPlaying(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(v => {
          const nv = Math.min(1, v + 0.1);
          if (videoRef.current) videoRef.current.volume = nv;
          return nv;
        });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(v => {
          const nv = Math.max(0, v - 0.1);
          if (videoRef.current) videoRef.current.volume = nv;
          return nv;
        });
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(m => {
          if (videoRef.current) videoRef.current.muted = !m;
          return !m;
        });
      } else if (e.key.toLowerCase() === 's') {
        takeScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, duration]);

  // CSS Filter styles
  const filterStyles: Record<VideoFilterType, string> = {
    none: 'none',
    cinematic: 'contrast(120%) saturate(125%) hue-rotate(-10deg)',
    cyberpunk: 'contrast(140%) saturate(180%) hue-rotate(185deg) brightness(105%)',
    vintage: 'sepia(45%) contrast(110%) brightness(95%) saturate(110%)',
    noir: 'grayscale(100%) contrast(140%) brightness(90%)',
    vibrant: 'saturate(200%) contrast(115%)',
    emerald: 'hue-rotate(90deg) contrast(130%) saturate(130%)',
    invert: 'invert(100%) hue-rotate(180deg)',
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 ${theaterMode ? 'max-w-none' : ''}`}>
      
      {/* Player Section */}
      <div 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative group rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 select-none transition-all duration-300"
      >
        {/* Ambient Backlight / Glow effect */}
        {ambientGlow && (
          <div 
            className="absolute -inset-4 rounded-3xl opacity-50 blur-3xl -z-10 transition-all duration-700 pointer-events-none"
            style={{
              background: activeFilter === 'cyberpunk' 
                ? 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(99,102,241,0.2) 70%, transparent 100%)'
                : activeFilter === 'vintage'
                ? 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, rgba(180,83,9,0.15) 70%, transparent 100%)'
                : activeFilter === 'emerald'
                ? 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.2) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0.2) 70%, transparent 100%)'
            }}
          />
        )}

        {/* Video Element */}
        <div 
          className="relative w-full overflow-hidden flex items-center justify-center bg-black cursor-pointer"
          style={{ 
            aspectRatio: aspectRatio === 'cover' ? undefined : aspectRatio,
            minHeight: '340px',
            maxHeight: '75vh'
          }}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={currentTrack.url}
            loop={isLooping}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain transition-all duration-300"
            style={{ 
              filter: filterStyles[activeFilter],
              objectFit: aspectRatio === 'cover' ? 'cover' : 'contain'
            }}
          />

          {/* Center Play/Pause Overlay Animation */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all">
              <div className="w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-transform duration-200 border border-white/20">
                <Play className="w-9 h-9 fill-current translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Screenshot Toast */}
          {screenshotSuccess && (
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-indigo-600/95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
              <Camera className="w-4 h-4" />
              <span>تم التقاط الصورة وتحميلها بنجاح!</span>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-12 pb-3 px-4 sm:px-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Custom Timeline Scrub Bar */}
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            onMouseMove={handleTimelineHover}
            onMouseLeave={() => setHoverTime(null)}
            className="relative w-full h-2 hover:h-3.5 bg-white/20 rounded-full cursor-pointer mb-3 transition-all duration-150 group/timeline flex items-center"
          >
            {/* Progress Fill */}
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Scrub Thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-indigo-600 scale-0 group-hover/timeline:scale-100 transition-transform" />
            </div>

            {/* Hover preview timestamp tooltip */}
            {hoverTime !== null && (
              <div 
                className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-white text-[10px] font-mono rounded border border-white/20 pointer-events-none shadow"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Bottom Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            
            {/* Left Controls: Play, Step, Time, Volume */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت (Space)' : 'تشغيل (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Step Frame Back & Forward */}
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => stepFrame(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="الرجوع إطار واحد (-0.04s)"
                >
                  <Rewind className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => stepFrame(true)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="التقدم إطار واحد (+0.04s)"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={() => {
                    soundManager.playClick(isMuted ? 700 : 400);
                    setIsMuted(!isMuted);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                  className="p-1.5 text-gray-300 hover:text-white transition"
                  title={isMuted ? 'إلغاء الكتم (M)' : 'كتم الصوت (M)'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                    if (videoRef.current) {
                      videoRef.current.volume = v;
                      videoRef.current.muted = v === 0;
                    }
                  }}
                  className="w-16 sm:w-20 accent-indigo-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Timestamp */}
              <div className="text-xs font-mono text-gray-300 select-none">
                <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Filter, Speed, Aspect, Screenshot, PiP, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Speed Dropdown */}
              <div className="relative group/speed">
                <button 
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200"
                  title="سرعة العرض"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{playbackSpeed}x</span>
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/speed:flex flex-col bg-[#141724] border border-white/15 rounded-xl p-1.5 shadow-2xl z-30 min-w-[70px]">
                  {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        soundManager.playClick(600);
                        setPlaybackSpeed(s);
                        if (videoRef.current) videoRef.current.playbackRate = s;
                      }}
                      className={`px-2 py-1 text-xs rounded-md text-center transition ${
                        playbackSpeed === s ? 'bg-indigo-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <button
                onClick={() => {
                  soundManager.playClick(650);
                  const ratios: AspectRatioType[] = ['16/9', '4/3', '21/9', 'cover'];
                  const next = ratios[(ratios.indexOf(aspectRatio) + 1) % ratios.length];
                  setAspectRatio(next);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition hidden md:block"
                title={`نسبة العرض: ${aspectRatio}`}
              >
                <Crop className="w-4 h-4" />
              </button>

              {/* Loop Toggle */}
              <button
                onClick={() => {
                  soundManager.playClick(isLooping ? 500 : 700);
                  setIsLooping(!isLooping);
                }}
                className={`p-2 rounded-xl transition ${
                  isLooping ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                title={isLooping ? 'إيقاف التكرار التلقائي' : 'تفعيل التكرار التلقائي'}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Frame Screenshot */}
              <button
                onClick={takeScreenshot}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                title="التقاط صورة من الفيديو (PNG)"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition hidden sm:block"
                title="صورة داخل صورة (PiP)"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                title="ملء الشاشة (F)"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Details & Quick Action Panel */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentTrack.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentTrack.resolution}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              {currentTrack.description}
            </p>
          </div>

          {/* Quick Player Enhancements */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                soundManager.playClick(600);
                setAmbientGlow(!ambientGlow);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                ambientGlow 
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>الإضاءة المحيطية</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick(600);
                setTheaterMode(!theaterMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                theaterMode 
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>وضع المسرح</span>
            </button>

            {/* Audio Booster Button (100% - 200%) */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-gray-300">مضخم الصوت:</span>
              {[1.0, 1.5, 2.0].map(gain => (
                <button
                  key={gain}
                  onClick={() => handleAudioBoostChange(gain)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                    audioBoost === gain ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {Math.round(gain * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Filters Row */}
        <div>
          <span className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            فلاتر الألوان والمؤثرات السينمائية الفورية:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'none', label: 'طبيعي (Normal)' },
              { id: 'cinematic', label: 'سينما (Cinematic)' },
              { id: 'cyberpunk', label: 'سايبربنك نيون (Cyberpunk)' },
              { id: 'vintage', label: 'أفلام السبعينات (Vintage)' },
              { id: 'noir', label: 'أبيض وأسود درامي (Noir)' },
              { id: 'vibrant', label: 'ألوان خارقة (Vibrant)' },
              { id: 'emerald', label: 'الزمرد الرقمي (Matrix)' },
              { id: 'invert', label: 'القلب اللوني (Invert)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  soundManager.playClick(650);
                  setActiveFilter(f.id as VideoFilterType);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  activeFilter === f.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add External / Local Video Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
          
          {/* Custom Stream URL */}
          <form onSubmit={handleLoadCustomUrl} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                placeholder="تشغيل أي رابط فيديو مباشر (MP4, WebM)..."
                value={customUrlInput}
                onChange={e => setCustomUrlInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
            >
              تشغيل الرابط
            </button>
          </form>

          {/* Local File Picker */}
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>اختر أو اسحب فيديو من جهازك (حاسوب / هاتف)</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleLocalVideoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preset Playlist & Bookmarks Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Curated Video Playlist (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              مكتبة المقاطع التجريبية فائقة السلاسة (60 FPS)
            </h3>
            <span className="text-xs text-gray-400">
              {PRESET_VIDEOS.length} مقاطع جاهزة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_VIDEOS.map(video => {
              const isSelected = currentTrack.id === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    soundManager.playClick(750);
                    setCurrentTrack(video);
                    setIsPlaying(true);
                  }}
                  className={`flex gap-3 p-2.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-[9px] font-mono rounded text-white font-bold">
                      {video.duration}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-white truncate">
                      {video.title}
                    </span>
                    <span className="text-[11px] text-indigo-300 mt-0.5">
                      {video.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {video.resolution}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Bookmarks & Timestamps (1 col) */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-pink-400" />
              علامات اللقطات المفضلة
            </h3>
            <span className="text-xs text-gray-400">
              {bookmarks.length} علامة
            </span>
          </div>

          {/* Add Bookmark form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`حفظ عند ${formatTime(currentTime)}...`}
              value={bookmarkLabel}
              onChange={e => setBookmarkLabel(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={addBookmark}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>حفظ</span>
            </button>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                لا توجد علامات مرجعية حتى الآن. اضغط حفظ عند أي لحظة تعجبك للرجوع إليها!
              </div>
            ) : (
              bookmarks.map(b => (
                <div
                  key={b.id}
                  onClick={() => {
                    soundManager.playClick(700);
                    if (videoRef.current) {
                      videoRef.current.currentTime = b.time;
                      setCurrentTime(b.time);
                    }
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[11px] font-bold">
                      {formatTime(b.time)}
                    </span>
                    <span className="text-xs text-gray-200 truncate">
                      {b.label}
                    </span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setBookmarks(prev => prev.filter(item => item.id !== b.id));
                    }}
                    className="p-1 rounded-lg text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
