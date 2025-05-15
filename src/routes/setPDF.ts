import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { send } from "process";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // 暫存位置

router.post("/uploadPage", upload.single("pageImage"), (req, res) => {
  const pageNum = req.body.pageNum;
  const note = req.body.note;
  const image = req.file;

  if (!pageNum || !image) {
    res.status(400).json({ error: "缺少頁碼或圖片" });
    return;
  }

  const uploadsDir = path.join(__dirname, "../../PDFpage", `page_${pageNum}`);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 儲存圖片
  const imagePath = path.join(uploadsDir, `${pageNum}.png`);
  fs.renameSync(image.path, imagePath);

  // 儲存筆記
  if (note) {
    const notePath = path.join(uploadsDir, `${pageNum}.txt`);
    fs.writeFileSync(notePath, note, "utf-8");
  }

  res.status(200).json({ status: "ok", page: pageNum });
  return;
});

router.get("/getPage", (req, res) => {

});

router.get("/getAllPages", (req, res) => {
  const baseDir = path.join(__dirname, "../../PDFpage");

  if (!fs.existsSync(baseDir)) {
    res.status(404).json({ error: "找不到資料夾 PDFpage" });
    return;
  }

  const pageDirs = fs.readdirSync(baseDir).filter(name => name.startsWith("page_"));

  const result = pageDirs.map(dirName => {
    const pageNum = dirName.split("_")[1];
    const pageDir = path.join(baseDir, dirName);
    const imagePath = path.join(pageDir, `${pageNum}.png`);
    const notePath = path.join(pageDir, `${pageNum}.txt`);

    let imageBase64 = "";
    let note = "";

    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      imageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    }

    if (fs.existsSync(notePath)) {
      note = fs.readFileSync(notePath, "utf-8");
    }

    return {
      pageNum,
      imageBase64,
      note
    };
  });

  res.status(200).json(result);
});

export default router;