# testServer

一個使用 TypeScript 開發的語音處理伺服器，提供語音轉文字、GPT 回應、語音合成、單字比對等功能。支援檔案上傳並整合 Whisper、TTS、GPT 等服務。

## 目錄結構
```
testServer
├─ src
│  ├─ tests/
│  ├─ routes/
│  │  ├─ gptRoutes.ts      # /api/gpt/chat
│  │  ├─ whisperRoutes.ts  # /api/whisper/…
│  │  ├─ textToSpeech.ts   # /api/tts
│  │  ├─ wordCompare.ts    # /api/word-compare
│  │  └─ audioToGpt.ts     # /api/audio/gpt
│  ├─ process.ts
│  └─ index.ts             # server entry
├─ uploads/                # uploaded audio files
├─ voice/                  # generated speech output
├─ jest.config.js
├─ tsconfig.json
├─ package.json
└─ .env
```

## 安裝與啟動

```bash
npm install
```

## 啟動開發伺服器
```bash
npm run dev
```