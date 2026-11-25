

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync } from "node:fs";

import { systemPrompt } from "./prompt.js";
import { model } from "./model.js";
import { calculator } from "./tools.js";
import { createDeepAgent } from "deepagents";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";

// Ensure data directory exists
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../data");
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "checkpoints.db");

// Persistent SQLite checkpointer
export const checkpointer = SqliteSaver.fromConnString(dbPath);

export const agent = createDeepAgent({
    model: model,
    systemPrompt: systemPrompt,
    tools: [calculator],
    checkpointer: checkpointer,
});

