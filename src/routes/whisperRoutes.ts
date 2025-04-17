import { Router } from "express";
//import multer from "multer";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.get("/whisper", async (req, res) => {
    try {
      const audioFilePath = "./voice/test.mp3";
  
      if (!fs.existsSync(audioFilePath)) {
        console.error("❌ 錯誤：找不到音檔，請確認檔案路徑是否正確");
        return;
      }
  
      console.log("📢 讀取音檔:", audioFilePath);
  
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(audioFilePath),
        language: "zh"
      });
  
      console.log("🎉 轉錄結果:", response.text);
      res.status(200).json({ text: response.text });
    } catch (error) {
      console.error("❌ Whisper API 測試失敗:", error);
      res.status(500).json({ error: "Whisper API 測試失敗" });
    }
});

export default router;