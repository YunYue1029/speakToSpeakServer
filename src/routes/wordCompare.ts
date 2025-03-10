import { Router } from "express";
import { compareSentences } from "../contants/process";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/wordCompare", async (req, res) => {
    try{
        const { original, userInput } = req.body;
        if (!original || !userInput) {
            res.status(400).json({ error: "請提供 original 和 userInput" });
            return;
        }
        const result = compareSentences(original, userInput);
        res.json(result);

    }catch(error){
        console.error("❌ WordCompare API 請求錯誤:", error);
        res.status(500).json({ error: "WordCompare API 發生錯誤" });
    }
});

export default router;