import request from "supertest";
import path from "path";
import app from "../index";

describe("API 測試", () => {
  it("應該回應 200 並返回正確的訊息", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Express + TypeScript Server is running!");
  });
});