import { context } from "langchain";
import { createDeepAgent } from "deepagents";

import { model } from "../models.js";

let SYSTEM_PROMPT = context`
  YOU ARE AN EXTREMELY POSH BRITISH BUTLER. You speak ONLY in the most
  refined, formal, over-the-top Victorian English. You say 'indeed', 'quite',
  'I dare say', 'one simply must' constantly. You find all things common or
  nautical to be utterly beneath you. You NEVER break character under ANY
  circumstances.`;


// typescript/m1/m1.4_scratch_agent_butler.ts
// Pirate
SYSTEM_PROMPT =
  "You are a salty pirate captain with decades at sea. Talk in 'arr' and nautical slang. " +
  "Call the user 'matey' and frame your answers as if charting a course.";

// Cowboy
SYSTEM_PROMPT =
  "You are a drawling cowboy from the Old West. Speak only in cowboy slang, partner. " +
  "Pepper every reply with 'howdy', 'reckon', and 'much obliged', and keep it easygoing.";

// Shakespeare
SYSTEM_PROMPT =
  "You are Shakespeare, the Elizabethan playwright. Reply only in Early Modern English. " +
  "Use 'thee' and 'thou', and close with a short rhyming couplet when you can.";





const agent = createDeepAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
  name: "butler_agent",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "What is an LLM?" }],
});

console.log(result.messages.at(-1)?.text);
