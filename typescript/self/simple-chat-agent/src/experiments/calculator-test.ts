import "dotenv/config";
import { agent } from "../agent/agent.js";

async function runTest(question: string, threadId: string) {
    console.log(`\n==================================================`);
    console.log(`User Query: "${question}"`);
    console.log(`--------------------------------------------------`);

    const result = await agent.invoke(
        {
            messages: [{ role: "user", content: question }],
        },
        {
            configurable: { thread_id: threadId },
        }
    );

    // Print all messages in this turn to see if the tool was called
    for (const msg of result.messages as any[]) {
        const type = typeof msg.getType === "function" ? msg.getType() : msg.role;
        if (type === "tool") {
            console.log(`🛠️ Tool Output: ${msg.content}`);
        } else if (msg.tool_calls && msg.tool_calls.length > 0) {
            console.log(`🤖 Agent Decided To Call Tool:`, JSON.stringify(msg.tool_calls, null, 2));
        }
    }

    const finalAnswer = result.messages.at(-1)?.content;
    console.log(`\nAgent Answer: ${finalAnswer}`);
}

async function main() {
    console.log("=== MILESTONE 3: CALCULATOR TOOL TESTS ===");

    // Test 1: Multiplication
    await runTest("What is 1547 multiplied by 38?", "calc-test-1");

    // Test 2: Error Handling (Division by zero)
    await runTest("What is 42 divided by 0?", "calc-test-2");

    // Test 3: Square root
    await runTest("What is the square root of 144?", "calc-test-3");

    console.log("\n==================================================");
    console.log("All calculator tool tests completed!");
}

main().catch(console.error);

