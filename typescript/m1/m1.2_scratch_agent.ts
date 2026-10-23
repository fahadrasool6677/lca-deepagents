import { createDeepAgent } from "deepagents";

import { model } from "../models.js";

const agent = createDeepAgent({
    model,
    systemPrompt: "You are a helpful assistant that answers questions about the course.",

});
console.log("Agent initialized ==================");

const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "How are you?"
        }
    ]
});

// console.log("Result==>", JSON.stringify(result));

console.log("-----------------------------------------------------");
console.log(result.messages.at(-1)?.text);
console.log("-----------------------------------------------------");

