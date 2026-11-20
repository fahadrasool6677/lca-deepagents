import { createDeepAgent } from "deepagents";
import { initChatModel } from "langchain";
import { MCPAdapter } from "@langchain/mcp-adapters";

const model = await initChatModel(
  "ollama:qwen3:14b",
  {
    timeout: 60_000,
    maxRetries: 2
  });

const adapter = new MCPAdapter({
  servers: { weather: { url: "https://docs.x.com/mcp" } },

})
const tools = await adapter.listTools();
console.log("Tools:", tools?.map((tool) => tool.name).join(", "));

const agent = createDeepAgent({
  model,
  systemPrompt: "",
  tools
})

const config = { configurable: { thread_id: "my-thread" } };

await agent.invoke(
  { messages: [{ role: "user", content: "Remember my favorite colour is blue." }] },
  config
);

await agent.invoke(
  { messages: [{ role: "user", content: "What is my favorite colour?" }] },
  config
);




const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "How are you?"
    }
  ]
});

console.log(result.messages.at(-1)?.text);