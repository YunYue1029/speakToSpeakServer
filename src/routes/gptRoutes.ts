import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "請提供 message 參數" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });
    res.json(response.choices[0].message);
    return;
  } catch (error) {
    console.error("❌ GPT API 請求錯誤:", error);
    res.status(500).json({ error: "GPT API 發生錯誤" });
  }
});

export default router;