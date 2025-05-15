import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//router
import gptRoutes from "./routes/gptTranslate";
//import whisperRoutes from "./routes/whisperRoutes";
import textToSpeachRoutes from "./routes/textToSpeach";
//import audioToGptRoutes from "./routes/audioToGptRoutes";
import agentRoutes from "./routes/agent";
import setPDF from "./routes/setPDF";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server is running!");
});

app.use("/api/gptTranslate", gptRoutes);
//app.use("/api/whisper", whisperRoutes);
//app.use("/api/wordCompare", wordCompareRoutes);
app.use("/api/TTS", textToSpeachRoutes);
//app.use("/api/audioToGpt", audioToGptRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/setPDF", setPDF);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
}

export default app;