import { agent } from "../agent/agent.js";

const config: any = { 
  configurable: { thread_id: "view-input-demo" },
  callbacks: [{
    handleChatModelStart(_llm: any, messages: any[][]) {
      console.log("\n================ MODEL RECEIVED THESE MESSAGES ================");
      messages[0].forEach((m: any, idx: number) => {
        const role = m.getType ? m.getType() : m.constructor.name;
        const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        console.log(`[Message ${idx}] (${role}):\n${text}\n`);
      });
      console.log("================================================================\n");
    }
  }]
};

console.log(">>> TURN 1: User says 'I live in New York.'");
await agent.invoke({ messages: [{ role: "user", content: "I live in New York." }] }, config);

console.log(">>> TURN 2: User says 'Where do I live?'");
const res = await agent.invoke({ messages: [{ role: "user", content: "Where do I live?" }] }, config);

console.log("Final Agent Output:", res.messages.at(-1)?.content);
