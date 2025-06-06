import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get("/", async (req, res) => {
  res.send("gptRoutes");
});

router.post("/translateToEnglish", async (req, res) => {
  try {
    const chineseSpeech = req.body.chineseSpeech;

    if (!chineseSpeech) {
      res.status(400).json({ error: "請提供中文演講稿" });
      return;
    }
    
    const prompt = "請將以下中文演講稿翻譯成英文，風格口語化、自然流暢，適合在報告中口說使用，不要過於書面化。" +
                   "可以根據英文語感略作調整，使內容在英文中聽起來更順暢。整體長度控制在 90 秒內。" +
                   "請根據語意結構進行合理分段，每一段要有四句以上，適當使用換行分隔段落，避免句子中斷或過短段落。" +
                   "不需要加上說明或結尾，不要擴展句子，只輸出翻譯後的英文講稿即可，並且一個段落就以兩個換行分開。" +
                   "以下是中文稿：「" + chineseSpeech + "」";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "我是一位研究者，目標是讓講稿內容自然流暢、專業清晰，適合在簡報中口語表達。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    console.log("🔄 GPT API 回應:", response.choices[0]?.message?.content);
    res.json({
      reply : response.choices[0]?.message?.content
    });
    return;
  } catch (error) {
    console.error("❌ GPT API 請求錯誤:", error);
    res.status(500).json({ error: "GPT API 發生錯誤" });
  }
});

// not prefer to use
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