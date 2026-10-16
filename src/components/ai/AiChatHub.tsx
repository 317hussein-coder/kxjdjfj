import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw, 
  Lightbulb, 
  Code, 
  BookOpen, 
  FileText, 
  Zap,
  Cpu
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { soundManager } from '../../utils/audio';

const PROMPT_SUGGESTIONS = [
  'ما هي أحدث تطورات الذكاء الاصطناعي في 2026؟',
  'اشرح لي نظرية النسبية العامة لآينشتاين ببساطة كأنني طفل',
  'أعطني خطة عملية من 4 خطوات لتعلم البرمجة وتطوير الويب',
  'اقترح 5 أفكار لمشاريع ناشئة مبتكرة وقابلة للتنفيذ السريع',
  'حلل لي كيف أنظم وقتي وفق طريقة بومودورو بفاعلية',
  'اكتب لي قصة خيال علمي قصيرة ومشوقة عن مدينة المستقبل'
];

const AI_PRESET_MODES = [
  { id: 'general', label: 'عام وشامل', icon: <Bot className="w-3.5 h-3.5" />, instruction: 'أنت مساعد ذكي فائق الدقة والسلاسة تجيب عن أي موضوع بوضوح وإيجاز ممتع باللغة العربية.' },
  { id: 'coding', label: 'مهندس برمجة', icon: <Code className="w-3.5 h-3.5" />, instruction: 'أنت مهندس برمجيات أول، تجيب بأكواد نظيفة وشروحات دقيقة وتقنيات حديثة.' },
  { id: 'teacher', label: 'معلم ومبسط', icon: <BookOpen className="w-3.5 h-3.5" />, instruction: 'أنت معلم صبور وممتع، تشرح المفاهيم المعقدة بأمثلة تشبيهية ملموسة وواضحة جداً.' },
  { id: 'summary', label: 'ملخص نصوص', icon: <FileText className="w-3.5 h-3.5" />, instruction: 'أنت خبير تلخيص، تستخلص جوهر النصوص في نقاط محددة وسريعة الاستيعاب.' },
  { id: 'creative', label: 'كاتب مبدع', icon: <Sparkles className="w-3.5 h-3.5" />, instruction: 'أنت كاتب أدبي مبدع، تصيغ الأفكار بأسلوب شيق وملهم وقصصي جذاب.' },
];

export const AiChatHub: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'مرحباً بك! أنا "سوبر إيه آي" (SuperAI) مساعدك الذكي في SuperHub 360 المدعوم بأحدث تقنيات Gemini.\n\nيمكنك سؤالي عن أي شيء: الشروحات، البرمجة، الحسابات، توليد الأفكار، أو استكشاف أكثر من 354 ميزة في التطبيق. كيف يمكنني مساعدتك اليوم؟',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<string>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    soundManager.playClick(750);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const currentModeObj = AI_PRESET_MODES.find(m => m.id === activeMode);
      const systemInstruction = currentModeObj ? currentModeObj.instruction : undefined;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemInstruction,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      soundManager.playSuccess();

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.error || 'عذراً، لم أتلقَ رداً واضحاً.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مجدداً.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    soundManager.playClick(600);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      alert('القارئ الصوتي غير مدعوم في هذا المتصفح.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    soundManager.playClick(700);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0600-\u06FF]/.test(text) ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    soundManager.playClick(500);
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome-renewed',
        role: 'assistant',
        content: 'تم مسح المحادثة بنجاح. كيف يمكنني مساعدتك في سؤالك الجديد؟',
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      
      {/* Header with Mode Presets */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                المساعد الذكي الفائق (SuperAI)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-gray-400">
              إجابات ذكية وسريعة وفائقة السلاسة لجميع استفساراتك
            </p>
          </div>
        </div>

        {/* AI Modes Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {AI_PRESET_MODES.map(mode => {
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  soundManager.playClick(650);
                  setActiveMode(mode.id);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}

          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-gray-400 hover:text-red-300 transition mr-1"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-3xl border border-white/10 p-4 sm:p-6 min-h-[460px] max-h-[65vh] overflow-y-auto space-y-4 no-scrollbar">
        {messages.map(msg => {
          const isAi = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'} animate-in fade-in duration-200`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                isAi 
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20' 
                  : 'bg-gradient-to-tr from-pink-600 to-rose-600 shadow-pink-500/20'
              }`}>
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed transition-all shadow-sm ${
                isAi
                  ? 'bg-[#131625] border border-white/10 text-gray-100 rounded-tr-sm'
                  : 'bg-indigo-600 text-white rounded-tl-sm'
              }`}>
                {/* Content formatting */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* AI Message Action Footer (Speak & Copy) */}
                {isAi && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5 text-gray-400">
                    <button
                      onClick={() => handleSpeak(msg.content, msg.id)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition ${
                        speakingId === msg.id
                          ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300 animate-pulse'
                          : 'bg-white/5 border-white/10 hover:text-white'
                      }`}
                      title="قراءة النص صوتياً"
                    >
                      {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{speakingId === msg.id ? 'إيقاف القراءة' : 'استمع'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:text-white transition"
                      title="نسخ الإجابة"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === msg.id ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#131625] border border-white/10 rounded-2xl px-4 py-3 text-xs text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>جاري صياغة الإجابة بذكاء وسلاسة...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-[11px] text-gray-400 flex-shrink-0 font-medium">اقتراحات:</span>
        {PROMPT_SUGGESTIONS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-gray-300 hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative glass-panel rounded-2xl border border-white/10 p-2 flex items-center gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="اكتب سؤالك هنا بكل حرية... (اضغط Enter للإرسال)"
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none px-3 py-2 max-h-32"
          dir="auto"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl transition flex items-center justify-center flex-shrink-0 shadow-lg ${
            input.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30 active:scale-95'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
          title="إرسال"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </div>

    </div>
  );
};
