import request from "supertest";
import app from "../index"; // 確保 index.ts 有 export default app

describe("翻譯中文演講稿 /translateToEnglish", () => {
  it("應該成功翻譯中文講稿為英文", async () => {
    const res = await request(app)
      .post("/api/gptTranslate/translateToEnglish")
      .send({
        chineseSpeech: "大家好，今天我要介紹人工智慧的應用。"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(10);
    console.log("📝 翻譯結果:", res.body.reply);
  });

  it("缺少 chineseSpeech 時應回傳錯誤", async () => {
    const res = await request(app)
      .post("/api/gptTranslate/translateToEnglish")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});