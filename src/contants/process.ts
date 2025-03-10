import diff from "fast-diff";
/**
 * 
 * @param original 
 * @param userInput 
 * @returns 
 */
export function compareSentences(original: string, userInput: string) {
    const changes = diff(original, userInput);
    let totalLength = Math.max(original.length, userInput.length);
    let correctCount = 0;
    let formattedDiff = "";
  
    for (const [type, text] of changes) {
      if (type === 0) {
        formattedDiff += text;
        correctCount += text.length;
      } else if (type === -1) {
        formattedDiff += `❌(${text})`;
      } else if (type === 1) {
        formattedDiff += `🔺[${text}]`;
      }
    }
    const similarity = ((correctCount / totalLength) * 100).toFixed(2);
    return { similarity: Number(similarity), diffResult: formattedDiff };
}