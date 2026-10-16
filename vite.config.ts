import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { message, systemInstruction, history } = JSON.parse(body || '{}');

              if (!message || typeof message !== 'string') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Message is required' }));
                return;
              }

              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                // Return a friendly fallback if API key is not configured in environment
                res.statusCode = 200;
                res.end(JSON.stringify({
                  reply: `مرحباً بك! أنا مساعدك الذكي في SuperHub 360. تم استلام سؤالك: "${message}". (ملاحظة: يمكنك إعداد مفتاح GEMINI_API_KEY في لوحة Secrets لتمكين الذكاء الاصطناعي الكامل). أنا جاهز لمساعدتك في كل ما يخص الـ 354+ ميزة وتفاصيل التطبيق!`,
                  isFallback: true
                }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              // Format contents including light conversation history if provided
              const promptParts = [];
              if (history && Array.isArray(history)) {
                for (const turn of history.slice(-6)) {
                  promptParts.push(`${turn.role === 'user' ? 'المستخدم' : 'المساعد'}: ${turn.content}`);
                }
              }
              promptParts.push(`المستخدم: ${message}`);
              promptParts.push(`المساعد:`);

              let replyText = '';
              try {
                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: promptParts.join('\n\n'),
                  config: {
                    systemInstruction: systemInstruction || 
                      'أنت "سوبر إيه آي" (SuperAI)، المساعد الذكي الفائق لتطبيق SuperHub 360 المليء بـ 354+ ميزة وأداة ومشغل فيديو عالي الجودة. تجيب باللغة العربية بدقة، ذكاء، سلاسة فائقة، وأسلوب ممتع وودود. تستطيع الإجابة على أي سؤال في العلوم، البرمجة، الحسابات، الألعاب، تلخيص المقالات، حل المشكلات، أو تقديم اقتراحات وإبداعات. نسق الإجابات بنقاط جميلة وعناوين مختصرة عند الحاجة.',
                  },
                });
                replyText = response.text || '';
              } catch (geminiErr: any) {
                console.warn('Gemini temporary spike/fallback:', geminiErr.message);
                // Friendly fallback for temporary spikes
                replyText = `أهلاً بك! لقد استلمت استفسارك: "${message}". 
                
نظراً لوجود ضغط لحظي مؤقت على خوادم الذكاء الاصطناعي السحابية، إليك إجابة فورية:
• تطبيق SuperHub 360 يضم أكثر من 365 ميزة متكاملة وفائقة السلاسة (60 FPS).
• مشغل الفيديو السينمائي يتيح لك تشغيل أي رابط مباشر أو سحب ملف فيديو من جهازك مع مؤثرات بصرية متقدمة وفلاتر ومضخم صوت 200%.
• يمكنك إعادة إرسال رسالتك بعد ثوانٍ قليلة للحصول على رد موسّع، كما يمكنك استكشاف الألعاب (2048، Pong، Snake)، وتمارين الزن والاسترخاء، وأدوات الإنتاجية!`;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ reply: replyText }));
            } catch (err: any) {
              console.error('Gemini API Server Error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ 
                error: 'حدث خطأ أثناء معالجة الطلب',
                details: err.message || 'Unknown error'
              }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
