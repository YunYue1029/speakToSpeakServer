import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';
import { Router } from 'express';
import { OpenAI } from 'openai';
import axios from 'axios';
import { functions } from '../contants/MCP_tools';
import { functions_test } from '../contants/MCP_tools';
import { ChatCompletionMessageParam } from "openai/resources/chat";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/user_audio';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `audio_${timestamp}.wav`);
  }
});
const upload = multer({ storage });

router.post('/audioTest', upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const inputText = req.body.inputText;
        if (!file) {
            res.status(400).json({ error: "沒有上傳音檔" });
            return;
        }

        console.log("✅ 收到音檔:", file.originalname);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.filename);

        try {
          const secondaryRes = await axios.post('http://127.0.0.1:8000/upload_user_audio', formData, {
            headers: formData.getHeaders(),
          });

          console.log('✅ 第二後端回應:', secondaryRes.data);
        } catch (err) {
          console.error('❌ 傳送到第二後端失敗:', err);
        }
        
        let finalResponse;
        let user_contest = "原本的句子為" + inputText + "使用者音檔為```user_audio/" + file.filename + "```";
        let messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一個英文口說老師，可以根據需求使用多種工具（文法檢查、句子比較等等）幫助使用者改善英文口說。" },
            { role: "user", content: user_contest }
          ];
        
          console.log(messages);
          
        while (true) {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            functions,
            function_call: "auto",
            temperature: 0.5,
          });
        
          const choice = response.choices[0];
          const message = choice.message;
        
          if (message.function_call) {
            const funcCall = message.function_call;
            const mcpPayload = {
              tool_calls: [
                {
                  id: `call-${Date.now()}`,
                  function: {
                    name: funcCall.name,
                    arguments: JSON.parse(funcCall.arguments || '{}')
                  }
                }
              ]
            };
            const mcpRes = await axios.post('http://localhost:8000/run', mcpPayload);
            const mcpResults = (mcpRes.data as { results: any[] }).results;
        
            // ✅ 把 tool response 丟回 GPT
            messages.push({ role: "assistant", function_call: funcCall });
            messages.push({
              role: "function",
              name: funcCall.name,
              content: JSON.stringify(mcpResults)
            });
            continue;
          }
          // 根據原文
          messages.push(message);
          messages.push({
              role: "user",
              content: "請根據以上資料，使用繁體中文整理學生的表現，不要將原本因該是英文的部分翻成中文，並提供清楚的建議。"+
                       "輸出請使用 JSON 格式，包含以下欄位：" + 
                       "spoken_text(學生實際說出的英文句子), " +
                       "differences(提供學生與原文中相異的地方，並且為小寫字母，回傳為一個字串陣列，例如：['bad', 'need']), " +
                       "accuracy(準確度百分比), " +
                       "suggestion(給學生的繁體中文學習建議，如果錯誤率太高，直接告訴他重新練習)。"+
                       "請生成對應 JSON 格式的分析。"
          });
          console.log(messages);
          // 呼叫最後總結
          finalResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages,
              temperature: 0,
          });
          break;
        }
        const rawMessage = finalResponse.choices[0].message;
        console.log(rawMessage);

        let parsedContent = {};
        try {
          const cleaned = rawMessage.content
            ?.replace(/```json\s*|\s*```/g, '')
            .trim();
        
          parsedContent = JSON.parse(cleaned || '{}');
        } catch (e) {
          console.error('❌ 無法解析 content 字串:', rawMessage.content);
        }
        fs.unlinkSync(file.path); // 刪除上傳的音檔
        res.json(parsedContent);
    } catch (error) {
        console.error("❌ 音檔處理失敗:", error);
        res.status(500).json({ error: "音檔處理發生錯誤" });
    }
});

router.post('/rehearsals_agent', async (req, res) => {
   try {
        const file = req.file;
        const inputText = req.body.inputText;
        if (!file) {
            res.status(400).json({ error: "沒有上傳音檔" });
            return;
        }

        console.log("✅ 收到音檔:", file.originalname);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.filename);

        try {
          const secondaryRes = await axios.post('http://127.0.0.1:8000/upload_user_audio', formData, {
            headers: formData.getHeaders(),
          });

          console.log('✅ 第二後端回應:', secondaryRes.data);
        } catch (err) {
          console.error('❌ 傳送到第二後端失敗:', err);
        }
        
        let finalResponse;
        let user_contest = "原本的句子為" + inputText + "使用者音檔為```user_audio/" + file.filename + "```";
        let messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一個英文口說老師，可以根據需求使用多種工具（文法檢查、句子比較等等）幫助使用者改善英文口說。" },
            { role: "user", content: user_contest }
          ];
        
          console.log(messages);
          
        while (true) {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            functions: functions_test,
            function_call: "auto",
            temperature: 0.5,
          });
        
          const choice = response.choices[0];
          const message = choice.message;
        
          if (message.function_call) {
            const funcCall = message.function_call;
            const mcpPayload = {
              tool_calls: [
                {
                  id: `call-${Date.now()}`,
                  function: {
                    name: funcCall.name,
                    arguments: JSON.parse(funcCall.arguments || '{}')
                  }
                }
              ]
            };
            const mcpRes = await axios.post('http://localhost:8000/run', mcpPayload);
            const mcpResults = (mcpRes.data as { results: any[] }).results;
        
            // ✅ 把 tool response 丟回 GPT
            messages.push({ role: "assistant", function_call: funcCall });
            messages.push({
              role: "function",
              name: funcCall.name,
              content: JSON.stringify(mcpResults)
            });
            continue;
          } else {
            finalResponse = response;
            break;
          }
        }
        const rawMessage = finalResponse.choices[0].message;
        console.log(rawMessage);

        let parsedContent = {};
        try {
          const cleaned = rawMessage.content
            ?.replace(/```json\s*|\s*```/g, '')
            .trim();
        
          parsedContent = JSON.parse(cleaned || '{}');
        } catch (e) {
          console.error('❌ 無法解析 content 字串:', rawMessage.content);
        }
        fs.unlinkSync(file.path);
        res.json(parsedContent);
    } catch (error) {
        console.error("❌ 音檔處理失敗:", error);
        res.status(500).json({ error: "音檔處理發生錯誤" });
    }
});

export default router;