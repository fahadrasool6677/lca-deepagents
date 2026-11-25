import "dotenv/config";
import { agent } from "../agent/agent.js";

async function main() {
  // Thread A
  await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "My name is Fahad.",
        },
      ],
    },
    {
      configurable: {
        thread_id: "fahad-001",
      },
    }
  );

  // Thread B
  await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "My name is Ali.",
        },
      ],
    },
    {
      configurable: {
        thread_id: "ali-001",
      },
    }
  );

  // Continue Thread A
  const response = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "What is my name?",
        },
      ],
    },
    {
      configurable: {
        thread_id: "fahad-001",
      },
    }
  );

  console.log(response.messages.at(-1)?.content);
}

main();