import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//router
import gptRoutes from "./routes/gptRoutes";
import whisperRoutes from "./routes/whisperRoutes";
import wordCompareRoutes from "./routes/wordCompare";
import textToSpeachRoutes from "./routes/textToSpeach";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server is running!");
});

app.use("/api/gpt", gptRoutes);
app.use("/api/whisper", whisperRoutes);
app.use("/api/wordCompare", wordCompareRoutes);
app.use("/api/textToSpeach", textToSpeachRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
}

export default app;