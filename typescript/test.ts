import { createDeepAgent } from "deepagents";

const agent = createDeepAgent();

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Analyze my project files and create a summary.md file.",
    },
  ],
});

console.log(result);