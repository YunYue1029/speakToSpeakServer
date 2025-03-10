import request from "supertest";
import app from "../index";

describe("API 測試", () => {
  it("應該回應 200 並返回正確的訊息", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Express + TypeScript Server is running!");
  });

  it("應該返回 400 當缺少必要參數時", async () => {
    const response = await request(app).post("/api/gpt/chat").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("應該能成功呼叫 GPT API", async () => {
    const response = await request(app).post("/api/gpt/chat").send({
      message: "你好"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("role", "assistant");
    expect(response.body).toHaveProperty("content");
  });
});

describe("WordCompare API 測試", () => {
  const testCases = [
    { original: "Hello world", userInput: "hello world", expectedResult: "match" },
    { original: "TypeScript is great", userInput: "TypeScript is amazing", expectedResult: "partial match" },
    { original: "I love programming", userInput: "I enjoy coding", expectedResult: "no match" },
  ];

  testCases.forEach(({ original, userInput, expectedResult }, index) => {
    it(`測試案例 ${index + 1}: '${original}' vs '${userInput}'`, async () => {
      const response = await request(app)
        .post("/api/wordCOmpare/wordCompare")
        .send({ original, userInput })
        .expect(200);

      console.log(response.body);
    });
  });

  it("缺少參數時應回傳 400", async () => {
    const response = await request(app)
      .post("/api/wordCOmpare/wordCompare")
      .send({ original: "Hello" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
});
