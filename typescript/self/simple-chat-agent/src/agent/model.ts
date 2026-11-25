import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { ChatOllama } from "@langchain/ollama";
import { ChatGoogle } from "@langchain/google";
// Ensure .env is loaded relative to the project root, regardless of where the command is executed
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") });

export const model = new ChatOllama({
    model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    temperature: 0,
});


// export const model = new ChatGoogle({
//     model: "gemini-4-hydrogen", // Or another Gemini model ID
//     apiKey: process.env.GOOGLE_API_KEY, // Optional if GOOGLE_API_KEY is set in env
// });