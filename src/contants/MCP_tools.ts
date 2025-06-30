export const functions = [
  {
    name: "grammar_check",
    description: "分析並回報輸入句子的文法錯誤",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "要檢查文法的英文句子"
        }
      },
      required: ["text"]
    }
  },
  {
    name: "compare_sentence_levenshtein",
    description: "比較學生口說與正確句子的差異",
    parameters: {
      type: "object",
      properties: {
        original: {
          type: "string",
          description: "正確參考句"
        },
        spoken: {
          type: "string",
          description: "學生實際講出的句子"
        }
      },
      required: ["original", "spoken"]
    }
  },
  {
    name: "translate",
    description: "將上傳的音訊進行語音辨識",
    parameters: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "音訊檔案在伺服器端的路徑"
        }
      },
      required: ["file_path"]
    }
  }
];

export const functions_rehearsal = [
  {
    name: "translate",
    description: "將上傳的音訊進行語音辨識",
    parameters: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "音訊檔案在伺服器端的路徑"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "grammar_check",
    description: "分析並回報輸入句子的文法錯誤",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "要檢查文法的英文句子"
        }
      },
      required: ["text"]
    }
  },
  {
    name: "predict_speech",
    description: "給予語音識別結果，推測使用者想要說的話",
    parameters: {
      type: "object",
      properties: {
        speech: {
          type: "string",
          description: "使用者實際說出的英文句子"
        }
      },
      required: ["speech"]
    }
  },
  {
    name: "compare_sentence_levenshtein",
    description: "比較學生口說與正確句子的差異",
    parameters: {
      type: "object",
      properties: {
        original: {
          type: "string",
          description: "正確參考句"
        },
        spoken: {
          type: "string",
          description: "學生實際講出的句子"
        }
      },
      required: ["original", "spoken"]
    }
  }
];