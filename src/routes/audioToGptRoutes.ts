import { Router } from 'express';
import multer from 'multer';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/analyzeAudio', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file?.path;
    const format = path.extname(filePath || '').substring(1); // 去掉 "."

    if (!filePath || !['mp3', 'wav', 'm4a'].includes(format)) {
      res.status(400).json({ error: '不支援的音訊格式' });
      return;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-audio-preview',
      modalities: ['text', 'audio'],
      audio: { voice: 'alloy', format:'wav'
       },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "What is in this recording?" },
            { type: 'input_audio', input_audio: { data: base64, format :'wav'} }
          ]
        }
      ],
      store: true
    });

    fs.unlinkSync(filePath);

    res.json({
      reply: response.choices[0]?.message?.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '音訊分析失敗' });
  }
});

export default router;