import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//router
import textToSpeachRoutes from "./routes/textToSpeach";
import gptRoutes from "./routes/gptTranslate";
import agentRoutes from "./routes/agent";
//import whisperRoutes from "./routes/whisperRoutes";
//import audioToGptRoutes from "./routes/audioToGptRoutes";
//import setPDF from "./routes/setPDF";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server is running!");
});

app.use("/api/gptTranslate", gptRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/TTS", textToSpeachRoutes);
//app.use("/api/whisper", whisperRoutes);
//app.use("/api/wordCompare", wordCompareRoutes);
//app.use("/api/setPDF", setPDF);
//app.use("/api/audioToGpt", audioToGptRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
}

export default app;