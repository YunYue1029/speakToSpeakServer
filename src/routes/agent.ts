import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';
import { Router } from 'express';
import { OpenAI } from 'openai';
import axios from 'axios';
import { functions } from '../contants/MCP_tools';
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
        let user_contest = "學生音檔為```user_audio/" + file.filename + "```";
        let messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一個英文老師，可以根據需求使用多種工具（文法檢查、句子比較等等）幫助學生。" },
            { role: "user", content: user_contest }
          ];
        
          console.log(messages);
          
        while (true) {
          const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages,
            functions,
            function_call: "auto"
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
        
            // 🔁 呼叫 MCP 拿結果
            const mcpRes = await axios.post('http://localhost:8000/run', mcpPayload);
            const mcpResults = (mcpRes.data as { results: any[] }).results;
        
            // ✅ 把 tool response 丟回 GPT
            messages.push({ role: "assistant", function_call: funcCall });
            messages.push({
              role: "function",
              name: funcCall.name,
              content: JSON.stringify(mcpResults)
            });
            continue; // loop 繼續下一輪
          }
        
          // 🔚 GPT 回完最終回答
          messages.push(message);
          // 加入最後要總結的任務說明
          messages.push({
              role: "user",
              content: "請根據以上所有工具分析結果與對話，使用繁體中文做出整理與建議，並用 JSON 格式輸出。"
          });
          
          // 呼叫最後總結
          finalResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages
          });
          break;
        }
        
        res.json({ reply: finalResponse.choices[0].message });
    } catch (error) {
        console.error("❌ 音檔處理失敗:", error);
        res.status(500).json({ error: "音檔處理發生錯誤" });
    }
});

router.post('/agent', async (req, res) => {
   try{
        const { prompt } = req.body;
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "你是一個英文教師，可以使用funcstions中的各種工具來協助學生。" },
                { role: "user", content: prompt }
            ],
            functions,
            temperature: 0.7,
        });
        res.status(200).json({
            reply: response.choices[0]
        });
        return;
   }catch(error){
       console.error("❌ agent API 請求錯誤:", error);
       res.status(500).json({ error: "agent API 發生錯誤" });
   } 
});

router.get('/test', async (req, res) => {
    try{
        let finalResponse;
        let messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一個英文老師，可以根據需求使用多種工具（文法檢查、句子比較等等）幫助學生。" },
            { role: "user", content: "學生音檔為```user_audio/MCP_introduction.wav```" }
          ];
          
          while (true) {
            const response = await openai.chat.completions.create({
              model: "gpt-4",
              messages,
              functions,
              function_call: "auto"
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
          
              // 🔁 呼叫 MCP 拿結果
              const mcpRes = await axios.post('http://localhost:8000/run', mcpPayload);
              const mcpResults = (mcpRes.data as { results: any[] }).results;
          
              // ✅ 把 tool response 丟回 GPT
              messages.push({ role: "assistant", function_call: funcCall });
              messages.push({
                role: "function",
                name: funcCall.name,
                content: JSON.stringify(mcpResults)
              });
              continue; // loop 繼續下一輪
            }
          
            // 🔚 GPT 回完最終回答
            messages.push(message);
            // 加入最後要總結的任務說明
            messages.push({
                role: "user",
                content: "請根據以上所有工具分析結果與對話，使用繁體中文做出整理與建議，並用 JSON 格式輸出。"
            });
            
            // 呼叫最後總結
            finalResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages
            });
            break;
          }
          
          res.json({ reply: finalResponse.choices[0].message });
          return;
    }catch(error){
        console.error("❌ agent API 測試錯誤:", error);
        res.status(500).json({ error: "agent API 測試失敗" });
    }
});

export default router;