import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API endpoint for Gemini chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, systemInstruction, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        reply: `مرحباً بك! أنا مساعدك الذكي في SuperHub 360. تم استلام سؤالك: "${message}". يرجى تعيين GEMINI_API_KEY للاستفادة الكاملة من الذكاء الاصطناعي.`,
        isFallback: true
      });
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
      console.warn('Gemini server fallback:', geminiErr.message);
      replyText = `أهلاً بك! لقد استلمت استفسارك: "${message}". أنا جاهز لمساعدتك في كل ما يخص الـ 365+ ميزة في SuperHub 360!`;
    }

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Serve frontend dist assets in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
