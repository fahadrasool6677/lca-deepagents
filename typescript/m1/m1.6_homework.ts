// typescript/m1/m1.6_homework.ts
/**
 * M1.6 Homework: Connect to a Different MCP Server.
 *
 * THE IDEA
 * Lab 1 connected to the LangChain docs MCP server and filtered its tools
 * down to just search_docs_by_lang_chain. This homework asks you to connect
 * to a different public MCP server entirely, one that requires no auth
 * beyond what your labs already use, and put one of its tools to work.
 *
 * Don't know where to look? A few free, no-auth public servers to try:
 *   - DeepWiki (https://mcp.deepwiki.com/mcp): ask questions about any
 *     public GitHub repo's code and docs.
 *   - X Docs (https://docs.x.com/mcp): search and retrieve X's public API
 *     documentation.
 * Or find your own!
 *
 * WHAT YOU FILL IN
 *   TODO 1: build a MultiServerMCPClient against a server of your own
 *     choosing, fetch and filter its tools, and return both the client
 *     and the filtered tool list.
 *   TODO 2: write a question suited to your chosen server's own domain,
 *     not Lab 1's "what is MCP..." question, which won't make sense to
 *     ask a server about GitHub repos, API docs, or whatever you picked.
 *
 * RUN
 *   cd typescript
 *   pnpm tsx ./m1/m1.6_homework.ts
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createDeepAgent } from "deepagents";

import { model } from "../models.js";

// ════════════════════════════════════════════════════════════════════════
// TODO 1: Build your MCP client and return its filtered tool list.
//
// Requirements:
//   - Point "url" at a different public MCP server than Lab 1's
//     docs-langchain server (no auth/API key required beyond what your
//     labs already use). See the file header for two ready-to-use options.
//   - Fetch tools with client.getTools() and filter them the same way
//     Lab 1 did, with an ALLOWED set.
//   - Return both the client (so it can be closed later) and the
//     filtered tools.
//
// Example shape (delete this and write your own):
//   async function buildTools() {
//     const client = new MultiServerMCPClient({
//       "my-server": { transport: "http", url: "https://..." },
//     });
//     const tools = await client.getTools();
//     const ALLOWED = new Set(["some_tool_name"]);
//     return { client, tools: tools.filter((t) => ALLOWED.has(t.name)) };
//   }
// ════════════════════════════════════════════════════════════════════════

type BuiltTools = {
  client: MultiServerMCPClient;
  tools: Awaited<ReturnType<MultiServerMCPClient["getTools"]>>;
};

const ALLOWED = new Set(["ask_wiki_question"]);

async function buildTools(): Promise<BuiltTools> {
  const client = new MultiServerMCPClient({
    deepwiki: { transport: "http", url: "https://mcp.deepwiki.com/mcp" },
  });

  try {
    const availableTools = await client.getTools();
    const tools = availableTools.filter((tool) => ALLOWED.has(tool.name));
    return { client, tools };
  } catch (error) {
    await client.close();
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════════════
// TODO 2: Write a question suited to your chosen server's own domain,
// not Lab 1's "what is MCP..." question.
// ════════════════════════════════════════════════════════════════════════

const QUESTION =
  "Using DeepWiki, explain the architecture of the public GitHub repository langchain-ai/deepagents, especially how create_deep_agent() and its middleware work.";

const { client, tools } = await buildTools();

try {
  const agent = createDeepAgent({ model, tools });

  const result = await agent.invoke({
    messages: [{ role: "user", content: QUESTION }],
  });

  console.log(result.messages.at(-1)?.text);
} finally {
  await client.close();
}
