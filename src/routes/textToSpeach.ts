import { Router } from "express";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/textToSpeach", async (req, res) => {
    try {
        const { text, speed } = req.body;
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

router.post("/textToSpeachSlower", async (req, res) => {
  try {
    const { text } = req.body;
    console.log("🔄 正在轉換文字為語音...");

    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const timestamp = Date.now();
    const originalPath = path.join(__dirname, `../../outputV/output-${timestamp}.mp3`);
    const slowPath = path.join(__dirname, `../../outputV/output-${timestamp}-slow.mp3`);

    fs.writeFileSync(originalPath, audioBuffer);
    console.log(`✅ 原始語音檔案已生成：${originalPath}`);

    // 使用 ffmpeg 放慢語音速度 (atempo 只能介於 0.5～2.0 之間)
    execSync(`ffmpeg -i "${originalPath}" -filter:a "atempo=0.8" -vn "${slowPath}"`);
    console.log(`🐢 放慢速度語音檔案已生成：${slowPath}`);

    const slowAudio = fs.readFileSync(slowPath);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="speech.mp3"',
      'Content-Length': slowAudio.length,
    });
    res.send(slowAudio);
  } catch (error) {
    console.error("❌ TTS 轉換或處理失敗:", error);
    res.status(500).json({ error: "TTS 轉換或處理失敗" });
  }
});

export default router;