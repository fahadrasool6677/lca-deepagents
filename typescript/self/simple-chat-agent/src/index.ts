import "dotenv/config";

import { startChat } from "./cli/chat.js";

async function main() {
  try {
    await startChat();
  } catch (error) {
    console.error("Application failed:", error);
    process.exitCode = 1;
  }
}

main();