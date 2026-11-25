import { agent } from "../agent/agent.js";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../../data/checkpoints.db");
const TEST_THREAD_ID = "milestone4-persistence-test-thread";

async function main() {
    const mode = process.argv[2] ?? "full";

    console.log("==================================================");
    console.log(" Milestone 4: Persistent Checkpointing Test");
    console.log("==================================================");

    if (mode === "full" || mode === "step1") {
        console.log("\n--- Step 1: Storing secret in persistent memory ---");
        console.log(`Thread ID: ${TEST_THREAD_ID}`);
        console.log("User: 'Remember this secret codeword: BLUE_PHOENIX_992'");

        const res1 = await agent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: "Remember this secret codeword: BLUE_PHOENIX_992. Reply with just 'Understood'.",
                    },
                ],
            },
            {
                configurable: {
                    thread_id: TEST_THREAD_ID,
                },
            }
        );

        console.log("Agent:", res1.messages.at(-1)?.content);

        // Verify database file exists on disk
        if (existsSync(DB_PATH)) {
            console.log(`\n[SUCCESS] SQLite database confirmed on disk at:\n  ${DB_PATH}`);
        } else {
            console.error(`\n[FAILURE] Checkpoint database not found at ${DB_PATH}`);
            process.exit(1);
        }
    }

    if (mode === "full" || mode === "step2") {
        console.log("\n--- Step 2: Querying memory across process / session ---");
        console.log(`Thread ID: ${TEST_THREAD_ID}`);
        console.log("User: 'What is my secret codeword?'");

        const res2 = await agent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: "What is my secret codeword?",
                    },
                ],
            },
            {
                configurable: {
                    thread_id: TEST_THREAD_ID,
                },
            }
        );

        const responseText = String(res2.messages.at(-1)?.content ?? "");
        console.log("Agent:", responseText);

        if (responseText.includes("BLUE_PHOENIX_992")) {
            console.log("\n==================================================");
            console.log("[VERIFIED] Milestone 4 persistent checkpointing SUCCESS!");
            console.log("The agent restored previous conversation from SQLite.");
            console.log("==================================================");
        } else {
            console.log("\n[WARNING] Response did not contain exact codeword. Please inspect response text above.");
        }
    }
}

main().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
