import { Router } from 'express';
import { OpenAI } from 'openai';
import axios from 'axios';
import { functions } from '../contants/MCP_tools';
import { ChatCompletionMessageParam } from "openai/resources/chat";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        let messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一個英文老師，可以根據需求使用多種工具（文法檢查、句子比較等等）幫助學生。" },
            { role: "user", content: "學生的音檔是```user_audio/MCP_introduction.wav```" }
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
            break;
          }
          
          // messages 最後就有 GPT 完整處理完所有 tool call 的回覆
          res.json({ reply: messages });
    }catch(error){
        console.error("❌ agent API 測試錯誤:", error);
        res.status(500).json({ error: "agent API 測試失敗" });
    }
});

export default router;