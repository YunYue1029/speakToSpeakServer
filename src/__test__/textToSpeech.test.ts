import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../index"; // 確保你有 export default app

describe("TTS 語音轉換測試", () => {
  it("應該能產生標準語音 mp3 並回傳路徑，並刪除該檔案", async () => {
    const res = await request(app)
      .post("/api/TTS/textToSpeach")
      .send({ text: "Hello, this is a test." });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("url");

    const filePath = res.body.url;
    console.log("🔊 生成的音檔:", filePath);

    // 刪除檔案（如果存在）
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ 測試後已刪除音檔:", filePath);
      }
    } catch (err) {
      console.error("❌ 測試時刪除失敗:", err);
    }
  });

  it("應該能回傳放慢速度後的語音 mp3，並刪除該檔案", async () => {
    const res = await request(app)
      .post("/api/TTS/textToSpeachSlower")
      .send({ text: "Hello, this is a slow test." });

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/audio\/mpeg/);
    expect(res.header["content-disposition"]).toContain("speech.mp3");
    expect(res.body).toBeInstanceOf(Buffer);

    const outputDir = path.join(__dirname, "../../outputV");
    const files = fs.readdirSync(outputDir)
      .filter(name => name.includes("-slow.mp3") || name.includes("output-"))
      .map(name => path.join(outputDir, name));

    for (const filePath of files) {
      try {
        fs.unlinkSync(filePath);
        console.log("🧪 測試後刪除:", filePath);
      } catch (err) {
        console.error("❌ 測試刪除失敗:", filePath, err);
      }
    }
  });

  it("缺少 text 時應回傳錯誤", async () => {
    const res = await request(app)
      .post("/api/TTS/textToSpeach")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});