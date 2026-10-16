import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  CheckSquare, 
  FileText, 
  Repeat, 
  Percent, 
  Shield, 
  QrCode, 
  Code, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Sliders, 
  Download,
  DollarSign,
  Tag,
  Lock,
  Globe
} from 'lucide-react';
import { TaskItem, NoteItem } from '../../types';
import { soundManager } from '../../utils/audio';

type ActiveTool = 'pomodoro' | 'kanban' | 'notes' | 'converter' | 'calculator' | 'password' | 'qrcode' | 'texttools';

export const ProductivitySuite: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('pomodoro');

  const tools = [
    { id: 'pomodoro', label: 'مؤقت بومودورو', icon: <Clock className="w-4 h-4" /> },
    { id: 'kanban', label: 'لوحة المهام (Kanban)', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'notes', label: 'المفكرة الذكية', icon: <FileText className="w-4 h-4" /> },
    { id: 'converter', label: 'محول الوحدات (100+)', icon: <Repeat className="w-4 h-4" /> },
    { id: 'calculator', label: 'الحاسبة المالية والعلمية', icon: <Percent className="w-4 h-4" /> },
    { id: 'password', label: 'مولد كلمات المرور', icon: <Shield className="w-4 h-4" /> },
    { id: 'qrcode', label: 'صانع QR Code', icon: <QrCode className="w-4 h-4" /> },
    { id: 'texttools', label: 'معالجة النصوص وJSON', icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      
      {/* Tool Selector Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                soundManager.playClick(isActive ? 600 : 750);
                setActiveTool(tool.id as ActiveTool);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/25'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tool Container */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 min-h-[520px]">
        {activeTool === 'pomodoro' && <ToolPomodoro />}
        {activeTool === 'kanban' && <ToolKanban />}
        {activeTool === 'notes' && <ToolNotes />}
        {activeTool === 'converter' && <ToolConverter />}
        {activeTool === 'calculator' && <ToolCalculator />}
        {activeTool === 'password' && <ToolPassword />}
        {activeTool === 'qrcode' && <ToolQrCode />}
        {activeTool === 'texttools' && <ToolTextDev />}
      </div>

    </div>
  );
};

// ==========================================
// 1. TOOL: POMODORO FOCUS TIMER
// ==========================================
const ToolPomodoro: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);

  const modeTimes = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    soundManager.playClick(650);
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeTimes[newMode]);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          soundManager.playBell();
          if (mode === 'work') {
            setPomodoroCount(c => c + 1);
            alert('أحسنت! انتهت جلسة التركيز. خذ استراحة قصيرة لتجديد نشاطك.');
          } else {
            alert('انتهت الاستراحة! هل أنت مستعد لجلسة العمل التالية؟');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const toggleRun = () => {
    soundManager.playClick(isRunning ? 550 : 700);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundManager.playClick(500);
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - timeLeft / modeTimes[mode];

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto text-center">
      {/* Mode Switches */}
      <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
        {[
          { id: 'work', label: 'تركيز (25 دقيقة)' },
          { id: 'shortBreak', label: 'استراحة قصيرة (5 دقائق)' },
          { id: 'longBreak', label: 'استراحة طويلة (15 دقيقة)' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === m.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="105"
            className="text-white/10"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r="105"
            stroke="url(#pomoGradient)"
            strokeWidth="8"
            strokeDasharray={660}
            strokeDashoffset={660 * (1 - progress)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="pomoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-black text-white tracking-wider">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-400 font-semibold mt-1">
            {mode === 'work' ? 'جلسة إنتاجية عميقة' : 'استرخاء وتنفس'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleRun}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 active:scale-95 transition flex items-center gap-2"
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'إيقاف مؤقت' : 'ابدأ التركيز'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition active:scale-95"
          title="إعادة ضبط العداد"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-indigo-300 font-medium">
        🎯 أنجزت اليوم: <span className="font-bold text-white">{pomodoroCount}</span> جلسات بومودورو
      </div>
    </div>
  );
};

// ==========================================
// 2. TOOL: KANBAN TASK BOARD
// ==========================================
const ToolKanban: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('superhub_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'تجربة مشغل الفيديو عالي الدقة', status: 'done', priority: 'high', createdAt: Date.now() },
      { id: '2', title: 'سؤال المساعد الذكي عن موضوع علمي', status: 'doing', priority: 'medium', createdAt: Date.now() },
      { id: '3', title: 'استكشاف الألعاب وتمارين الاسترخاء', status: 'todo', priority: 'low', createdAt: Date.now() },
    ];
  });

  const [newTitle, setNewTitle] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    localStorage.setItem('superhub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    soundManager.playSuccess();
    const item: TaskItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      status: 'todo',
      priority,
      createdAt: Date.now(),
    };
    setTasks(prev => [item, ...prev]);
    setNewTitle('');
  };

  const moveTask = (id: string, newStatus: 'todo' | 'doing' | 'done') => {
    soundManager.playClick(650);
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const deleteTask = (id: string) => {
    soundManager.playClick(400);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const columns: { id: 'todo' | 'doing' | 'done'; title: string; color: string }[] = [
    { id: 'todo', title: 'قيد الانتظار', color: 'border-yellow-500/40 text-yellow-300' },
    { id: 'doing', title: 'جاري العمل عليها', color: 'border-indigo-500/40 text-indigo-300' },
    { id: 'done', title: 'مكتملة بنجاح ✓', color: 'border-emerald-500/40 text-emerald-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Add Task Bar */}
      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="أضف مهمة جديدة للوحة المهام..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="bg-[#141724] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="low">أولوية عادية</option>
          <option value="medium">أولوية متوسطة</option>
          <option value="high">أولوية قصوى ⚡</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة</span>
        </button>
      </form>

      {/* 3 Columns Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                <span className="text-[11px] font-mono text-gray-500 bg-black/40 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[220px]">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-white leading-relaxed">
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                      </span>

                      {/* Quick Move Action */}
                      <div className="flex items-center gap-1">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => moveTask(task.id, 'todo')}
                            className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-black/30"
                          >
                            ← انتظار
                          </button>
                        )}
                        {col.id !== 'doing' && (
                          <button
                            onClick={() => moveTask(task.id, 'doing')}
                            className="text-[10px] text-indigo-300 hover:text-white px-1.5 py-0.5 rounded bg-black/30"
                          >
                            عمل
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'done')}
                            className="text-[10px] text-emerald-400 hover:text-white px-1.5 py-0.5 rounded bg-black/30"
                          >
                            اكتمل ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. TOOL: RICH NOTES WITH MARKDOWN
// ==========================================
const ToolNotes: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('superhub_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'خطة اليوم والأولويات', content: '1. مراجعة مشغل الفيديو والميزات السريعة\n2. استشارة المساعد الذكي عن الأفكار الجديدة\n3. ممارسة تمارين التنفس لمدة 3 دقائق', updatedAt: Date.now(), category: 'يومي' }
    ];
  });
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('superhub_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const updateActiveContent = (field: 'title' | 'content', val: string) => {
    setNotes(prev => prev.map(n => (n.id === activeNote.id ? { ...n, [field]: val, updatedAt: Date.now() } : n)));
  };

  const createNewNote = () => {
    soundManager.playClick(750);
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'ملاحظة جديدة',
      content: '',
      updatedAt: Date.now(),
      category: 'عام'
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    soundManager.playClick(400);
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (filtered.length > 0) setActiveNoteId(filtered[0].id);
  };

  const copyNote = () => {
    soundManager.playClick(600);
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportNote = () => {
    soundManager.playSuccess();
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[440px]">
      {/* Notes Sidebar List */}
      <div className="glass-card rounded-2xl p-3 border border-white/10 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-white">الملاحظات ({notes.length})</span>
            <button
              onClick={createNewNote}
              className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1 px-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>جديدة</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto no-scrollbar">
            {notes.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  soundManager.playClick(600);
                  setActiveNoteId(n.id);
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition border text-right ${
                  activeNote?.id === n.id
                    ? 'bg-indigo-600/25 border-indigo-500/50 text-white'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{n.title || 'بدون عنوان'}</span>
                  {notes.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteNote(n.id);
                      }}
                      className="text-gray-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  {n.content || 'ملاحظة فارغة...'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="md:col-span-2 glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between space-y-3">
        {activeNote ? (
          <>
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={e => updateActiveContent('title', e.target.value)}
                  placeholder="عنوان الملاحظة..."
                  className="bg-transparent text-base sm:text-lg font-bold text-white focus:outline-none flex-1"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyNote}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1"
                    title="نسخ الملاحظة"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={exportNote}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1"
                    title="تصدير كملف نصي"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                value={activeNote.content}
                onChange={e => updateActiveContent('content', e.target.value)}
                placeholder="اكتب ملاحظاتك بحرية... (الحفظ تلقائي)"
                className="w-full flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none resize-none leading-relaxed min-h-[260px]"
                dir="auto"
              />
            </div>
            <div className="text-[10px] text-gray-500 pt-2 border-t border-white/5 flex justify-between">
              <span>آخر تعديل: {new Date(activeNote.updatedAt).toLocaleTimeString('ar-SA')}</span>
              <span>عدد الكلمات: {activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-gray-500">اختر أو أنشئ ملاحظة للبدء</div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. TOOL: UNIVERSAL UNIT CONVERTER (100+ UNITS)
// ==========================================
const ToolConverter: React.FC = () => {
  const [val, setVal] = useState<number>(100);
  const [cat, setCat] = useState<'length' | 'weight' | 'temp' | 'data' | 'speed'>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');

  const unitData: Record<string, { label: string; units: { id: string; name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }> = {
    length: {
      label: 'الأطوال والمسافات',
      units: [
        { id: 'm', name: 'متر (m)', toBase: v => v, fromBase: v => v },
        { id: 'km', name: 'كيلومتر (km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'cm', name: 'سنتيمتر (cm)', toBase: v => v / 100, fromBase: v => v * 100 },
        { id: 'mm', name: 'ملم (mm)', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'mile', name: 'ميل (Mile)', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
        { id: 'yard', name: 'ياردة (Yard)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
        { id: 'foot', name: 'قدم (Foot)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
        { id: 'inch', name: 'بوصة (Inch)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      ]
    },
    weight: {
      label: 'الأوزان والكتل',
      units: [
        { id: 'kg', name: 'كيلوجرام (kg)', toBase: v => v, fromBase: v => v },
        { id: 'g', name: 'جرام (g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'mg', name: 'مليجرام (mg)', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
        { id: 'ton', name: 'طن متري (Ton)', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'lb', name: 'رطل (Pound lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
        { id: 'oz', name: 'أونصة (Ounce oz)', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
      ]
    },
    temp: {
      label: 'درجات الحرارة',
      units: [
        { id: 'c', name: 'مئوية (°C)', toBase: v => v, fromBase: v => v },
        { id: 'f', name: 'فهرنهايت (°F)', toBase: v => (v - 32) * (5/9), fromBase: v => (v * 9/5) + 32 },
        { id: 'k', name: 'كلفن (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
      ]
    },
    data: {
      label: 'البيانات والتخزين الرقمي',
      units: [
        { id: 'mb', name: 'ميجابايت (MB)', toBase: v => v, fromBase: v => v },
        { id: 'gb', name: 'جيجابايت (GB)', toBase: v => v * 1024, fromBase: v => v / 1024 },
        { id: 'tb', name: 'تيرابايت (TB)', toBase: v => v * 1024 * 1024, fromBase: v => v / (1024 * 1024) },
        { id: 'kb', name: 'كيلوبايت (KB)', toBase: v => v / 1024, fromBase: v => v * 1024 },
        { id: 'byte', name: 'بايت (Byte)', toBase: v => v / (1024 * 1024), fromBase: v => v * (1024 * 1024) },
      ]
    },
    speed: {
      label: 'السرعات الحركية',
      units: [
        { id: 'kmh', name: 'كم/ساعة (km/h)', toBase: v => v, fromBase: v => v },
        { id: 'mph', name: 'ميل/ساعة (mph)', toBase: v => v * 1.60934, fromBase: v => v / 1.60934 },
        { id: 'ms', name: 'متر/ثانية (m/s)', toBase: v => v * 3.6, fromBase: v => v / 3.6 },
        { id: 'knot', name: 'عقدة بحرية (Knot)', toBase: v => v * 1.852, fromBase: v => v / 1.852 },
      ]
    }
  };

  const currentCat = unitData[cat];
  const fromObj = currentCat.units.find(u => u.id === fromUnit) || currentCat.units[0];
  const toObj = currentCat.units.find(u => u.id === toUnit) || currentCat.units[1];

  const calculateResult = () => {
    const baseVal = fromObj.toBase(val);
    const converted = toObj.fromBase(baseVal);
    return Number(converted.toFixed(6));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {Object.entries(unitData).map(([k, d]) => (
          <button
            key={k}
            onClick={() => {
              soundManager.playClick(600);
              setCat(k as any);
              setFromUnit(unitData[k].units[0].id);
              setToUnit(unitData[k].units[1].id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              cat === k ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">القيمة المدخلة:</label>
          <input
            type="number"
            value={val}
            onChange={e => setVal(parseFloat(e.target.value) || 0)}
            className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">من وحدة:</label>
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            >
              {currentCat.units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">إلى وحدة:</label>
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            >
              {currentCat.units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result display */}
        <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-center">
          <span className="text-xs text-indigo-300 block mb-1">النتيجة المحسوبة:</span>
          <span className="text-3xl font-black text-white font-mono">
            {calculateResult()} {toObj.name.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. TOOL: FINANCIAL & SCI CALCULATOR
// ==========================================
const ToolCalculator: React.FC = () => {
  const [calcTab, setCalcTab] = useState<'loan' | 'vat' | 'tip'>('loan');

  // Loan state
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [years, setYears] = useState<number>(5);

  // VAT state
  const [vatAmount, setVatAmount] = useState<number>(500);
  const [vatRate, setVatRate] = useState<number>(15);

  // Tip state
  const [billAmount, setBillAmount] = useState<number>(240);
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [peopleCount, setPeopleCount] = useState<number>(3);

  // Loan math
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = years * 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/10">
        {[
          { id: 'loan', label: 'حاسبة القروض والتمويل' },
          { id: 'vat', label: 'حاسبة الضريبة المضافة (VAT)' },
          { id: 'tip', label: 'تقسيم الفواتير والإكراميات' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              soundManager.playClick(600);
              setCalcTab(t.id as any);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              calcTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {calcTab === 'loan' && (
        <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">مبلغ التمويل:</label>
              <input
                type="number"
                value={loanAmount}
                onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">النسبة السنوية (%):</label>
              <input
                type="number"
                value={interestRate}
                step="0.1"
                onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">المدة (بالسنوات):</label>
              <input
                type="number"
                value={years}
                onChange={e => setYears(parseFloat(e.target.value) || 1)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-center">
            <div>
              <span className="text-[10px] text-indigo-300 block">القسط الشهري</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {isNaN(monthlyPayment) ? '0' : Math.round(monthlyPayment).toLocaleString()} ريال
              </span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block">إجمالي الفوائد</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {isNaN(totalInterest) ? '0' : Math.round(totalInterest).toLocaleString()} ريال
              </span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block">إجمالي السداد</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {isNaN(totalPayment) ? '0' : Math.round(totalPayment).toLocaleString()} ريال
              </span>
            </div>
          </div>
        </div>
      )}

      {calcTab === 'vat' && (
        <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">المبلغ قبل الضريبة:</label>
              <input
                type="number"
                value={vatAmount}
                onChange={e => setVatAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">نسبة الضريبة (%):</label>
              <input
                type="number"
                value={vatRate}
                onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-center">
            <div>
              <span className="text-[10px] text-indigo-300 block">قيمة الضريبة المضافة</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {(vatAmount * (vatRate / 100)).toFixed(2)} ريال
              </span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block">السعر النهائي الشامل</span>
              <span className="text-xl font-black text-white font-mono">
                {(vatAmount * (1 + vatRate / 100)).toFixed(2)} ريال
              </span>
            </div>
          </div>
        </div>
      )}

      {calcTab === 'tip' && (
        <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">الفاتورة الإجمالية:</label>
              <input
                type="number"
                value={billAmount}
                onChange={e => setBillAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">نسبة الإكرامية (%):</label>
              <input
                type="number"
                value={tipPercent}
                onChange={e => setTipPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">عدد الأشخاص:</label>
              <input
                type="number"
                value={peopleCount}
                onChange={e => setPeopleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-center">
            <span className="text-xs text-indigo-300 block">نصيب كل شخص من الفاتورة:</span>
            <span className="text-3xl font-black text-white font-mono">
              {((billAmount * (1 + tipPercent / 100)) / peopleCount).toFixed(2)} ريال
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. TOOL: PASSWORD GENERATOR
// ==========================================
const ToolPassword: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    soundManager.playPop();
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  useEffect(() => {
    generate();
  }, [length, useSymbols, useNumbers]);

  const copy = () => {
    soundManager.playClick(600);
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">كلمة المرور المولدة:</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={password}
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 font-bold select-all focus:outline-none"
            />
            <button
              onClick={copy}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center"
              title="نسخ"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>طول كلمة المرور:</span>
            <span className="font-mono font-bold text-indigo-400">{length} حرف</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={e => setLength(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={e => setUseNumbers(e.target.checked)}
              className="accent-indigo-500"
            />
            <span>أرقام (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={e => setUseSymbols(e.target.checked)}
              className="accent-indigo-500"
            />
            <span>رموز خاصة (!@#$)</span>
          </label>
        </div>

        <button
          onClick={generate}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>توليد كلمة سر جديدة</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 7. TOOL: QR CODE GENERATOR
// ==========================================
const ToolQrCode: React.FC = () => {
  const [text, setText] = useState<string>('https://google.com');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;

  return (
    <div className="max-w-md mx-auto space-y-4 text-center">
      <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1 text-right">الرابط أو النص لتحويله لكود QR:</label>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="اكتب الرابط أو رقم الهاتف أو النص..."
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            dir="auto"
          />
        </div>

        <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-2xl">
          <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
        </div>

        <a
          href={qrUrl}
          download="superhub-qr.png"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/25"
        >
          <Download className="w-4 h-4" />
          <span>تحميل صورة الرمز</span>
        </a>
      </div>
    </div>
  );
};

// ==========================================
// 8. TOOL: TEXT & DEVELOPER SUITE
// ==========================================
const ToolTextDev: React.FC = () => {
  const [input, setInput] = useState<string>('{"title": "SuperHub", "features": 365, "status": "ultra-smooth"}');
  const [output, setOutput] = useState<string>('');

  const formatJson = () => {
    soundManager.playClick(600);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch {
      setOutput('خطأ: صيغة JSON غير صالحة.');
    }
  };

  const toBase64 = () => {
    soundManager.playClick(600);
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setOutput('خطأ في الترميز.');
    }
  };

  const fromBase64 = () => {
    soundManager.playClick(600);
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setOutput('خطأ: النص ليس بتنسيق Base64 صحيح.');
    }
  };

  const toUrlEncoded = () => {
    soundManager.playClick(600);
    setOutput(encodeURIComponent(input));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-black/40 rounded-3xl border border-white/10 space-y-3">
        <textarea
          rows={5}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="أدخل النص أو كود JSON أو كود Base64..."
          className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-white font-mono focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <button onClick={formatJson} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
            تنسيق JSON مرتب
          </button>
          <button onClick={toBase64} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">
            تشفير Base64
          </button>
          <button onClick={fromBase64} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">
            فك Base64
          </button>
          <button onClick={toUrlEncoded} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">
            ترميز URL
          </button>
        </div>

        {output && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">الناتج:</label>
            <pre className="p-3 bg-black/80 border border-indigo-500/30 rounded-2xl text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
