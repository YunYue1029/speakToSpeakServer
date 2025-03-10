import { Router } from "express";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/textToSpeach", async (req, res) => {
    try {
        const { text } = req.body;
        console.log("🔄 正在轉換文字為語音...");
    
        const ttsResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: text,
        });
    
        const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
        const filePath = path.join(__dirname, `../../outputV/output-${Date.now()}.mp3`);
    
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`✅ 語音檔案已生成：${filePath}`);
        res.status(200).json({ url: filePath });
      } catch (error) {
        console.error("❌ TTS 轉換失敗:", error);
        res.status(500).json({ error: "TTS 轉換失敗" });
      }
});

export default router;