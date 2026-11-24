import { createInterface } from "node:readline/promises";
import { agent } from "../agent/agent";

export const startChat = async () => {

    const in_out = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const threadId = "demo-chat-session";

    console.log("\n================================");
    console.log("       SIMPLE CHAT AGENT");
    console.log("================================");
    console.log("Type 'exit' to quit.\n");

    try {
        while (true) {
            const input = await in_out.question("You: ");

            if (input.trim().toLowerCase() === "exit" || input.trim().toLowerCase() === "quit") {
                console.log("\nGood bye from the agent!");
                break;
            }

            if (!input?.trim()) {
                continue;
            }

            console.log("\nAgent: Thinking...\n");
            try {
                const result = await agent.invoke(
                    {
                        messages: [{
                            role: "user",
                            content: input
                        }]
                    },
                    {
                        configurable: { thread_id: threadId },
                    }
                );

                const lastMessage = result.messages.at(-1);

                console.log("Agent:", lastMessage?.content, "\n");

            } catch (error) {
                console.error("\nError:", error);
            }

            console.log("\n================================\n");
        }
    } finally {
        in_out.close();
    }
};
