import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";

import { model } from "../models.js";

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { Serialized } from "@langchain/core/load/serializable";
import type { BaseMessage } from "@langchain/core/messages";

class ModelInputLogger extends BaseCallbackHandler {
  name = "model_input_logger";

  handleChatModelStart(_model: Serialized, messages: BaseMessage[][]) {
    console.dir(messages, { depth: null });
  }
}


const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "chinook.db");
const db = new DatabaseSync(DB_PATH);

const SYSTEM_PROMPT = `You are a SQL analyst with access to the Chinook music store database.

Rules:
- Use read_sql for SELECT queries.
- Do not modify the database.
- If a tool returns an error, revise the SQL and try again.
- Show your SQL in your final answer.
`;

const readSql = tool(
  ({ query }) => {
    try {
      console.log("Tool Query:", query);
      const rows = db.prepare(query).all();
      console.log("Tool Result", JSON.stringify(rows));
      return JSON.stringify(rows);

    } catch (e) {
      console.log("Tool Error:", e);
      return `Error: ${e}`;
    }
  },
  {
    name: "read_sql",
    description: "Run a read-only SELECT query against the Chinook music store database.",
    schema: z.object({ query: z.string() }),
  }
);

const querDummyJson = tool(
  async ({ }) => {
    try {
      console.log("fetching dummy json");
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = response.json();
      return data//JSON.stringify({ message: "This is a dummy tool to test the agent" });
    }
    catch (error) {
      console.error("Error fetching dummy JSON:", error);
      return JSON.stringify({ error: "Failed to fetch dummy JSON" });
    }
  }, {
  name: "query_dummy_json",
  description: "A dummy tool to test the agent",
  schema: z.object({}),
}
)

const agent = createDeepAgent({
  model,
  name: "SQL_Agent",
  tools: [readSql, querDummyJson],
  systemPrompt: SYSTEM_PROMPT,
});

const result = await agent.invoke(
  {
    messages: [{
      role: "user",
      content: "Which five genres have the most tracks? and get the JSON from the dummy tool"
    }],
  },
  {
    callbacks: [new ModelInputLogger()]
  }

);

console.log(result.messages.at(-1)?.text);
