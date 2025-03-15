import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/noSpeechWithImg", async (req, res) => {
  try {
    const { model, userinfo, prompt, imageUrl, temperature } = req.body;

    if (!model && !prompt && ! userinfo && !temperature && !imageUrl) {
      res.status(400).json({ error: "請提供參數" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: userinfo },
        { role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl },},
        ],
        },
      ],
      temperature: temperature || 0.5,
    });
    res.json({
      model : model,
      userinfo : userinfo,
      prompt : prompt,
      temperature : temperature,
      reply : response.choices[0]?.message?.content
    });
    return;
  } catch (error) {
    console.error("❌ GPT API 請求錯誤:", error);
    res.status(500).json({ error: "GPT API 發生錯誤" });
  }
});

router.post("/WithSpeechNoImg", async (req, res) => {
  try {
    const { model, userinfo, prompt, temperature } = req.body;

    if (!model && !prompt && ! userinfo && !temperature) {
      res.status(400).json({ error: "請提供參數" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: userinfo },
        { role: "user", content: prompt }
      ],
      temperature: temperature || 0.5,
    });
    res.json({
      model : model,
      userinfo : userinfo,
      prompt : prompt,
      temperature : temperature,
      reply : response.choices[0]?.message?.content
    });
    return;
  } catch (error) {
    console.error("❌ GPT API 請求錯誤:", error);
    res.status(500).json({ error: "GPT API 發生錯誤" });
  }
});

export default router;