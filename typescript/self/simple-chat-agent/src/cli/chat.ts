
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { BaseMessage } from "@langchain/core/messages";

import { agent } from "../agent/agent.js";

// Persistence path for thread index
const __dirname = dirname(fileURLToPath(import.meta.url));
const THREADS_FILE = join(__dirname, "../../data/threads.json");

// 1. Define the structure of a conversation
interface ChatThread {
    id: string;
    title: string;
    createdAt: Date;
}

// 2. Manage conversations in the CLI
const threads: ChatThread[] = [];

let currentThreadId = "";

function loadThreads(): ChatThread[] {
    try {
        if (existsSync(THREADS_FILE)) {
            const raw = readFileSync(THREADS_FILE, "utf-8");
            const parsed = JSON.parse(raw);
            return parsed.map((t: any) => ({
                ...t,
                createdAt: new Date(t.createdAt),
            }));
        }
    } catch {
        // Fallback
    }
    return [];
}

function saveThreads(): void {
    try {
        const dataDir = join(__dirname, "../../data");
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }
        writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2), "utf-8");
    } catch (e) {
        console.error("Failed to save threads:", e);
    }
}

// 3. Create a new conversation
function createThread(): ChatThread {
    const thread: ChatThread = {
        id: randomUUID(),
        title: "New conversation",
        createdAt: new Date(),
    };

    threads.push(thread);
    saveThreads();

    return thread;
}

// 4. List all conversations
function listThreads(): void {
    console.log("\nAvailable Conversations:");

    if (threads.length === 0) {
        console.log("No conversations found.");
        return;
    }

    threads.forEach((thread, index) => {
        const active =
            thread.id === currentThreadId ? " (ACTIVE)" : "";

        console.log(
            `${index + 1}. ${thread.title} [${thread.id}]${active}`
        );
    });

    console.log();
}

// 5. Switch to another conversation
async function switchThread(
    rl: ReturnType<typeof createInterface>
): Promise<void> {
    listThreads();

    const answer = await rl.question(
        "Enter thread ID: "
    );

    const selectedThread = threads.find(
        (thread) => thread.id === answer.trim()
    );

    if (!selectedThread) {
        console.log("\nConversation not found.\n");
        return;
    }

    currentThreadId = selectedThread.id;

    console.log(
        `\nSwitched to: ${selectedThread.title}`
    );

    console.log(`Thread ID: ${currentThreadId}\n`);
}

// 6. Show current conversation history

async function showHistory(): Promise<void> {
    const state = await agent.getState({
        configurable: {
            thread_id: currentThreadId,
        },
    }) as any;

    const messages =
        (state?.values as { messages?: BaseMessage[] } | undefined)
            ?.messages ?? [];

    console.log("\n========== CHAT HISTORY ==========\n");

    if (messages.length === 0) {
        console.log("No messages in this conversation.\n");
        return;
    }

    for (const message of messages) {
        const role = message.getType();

        const label =
            role === "human"
                ? "You"
                : role === "ai"
                    ? "Agent"
                    : role;

        const content =
            typeof message.content === "string"
                ? message.content
                : JSON.stringify(message.content);

        console.log(`${label}: ${content}\n`);
    }

    console.log("==================================\n");
}

// 7. Handle normal user messages
async function sendMessage(input: string): Promise<void> {
    const thread = threads.find(
        (item) => item.id === currentThreadId
    );

    if (!thread) {
        console.log("Active conversation not found.");
        return;
    }

    // Set conversation title using its first message
    if (thread.title === "New conversation") {
        thread.title =
            input.length > 30
                ? input.slice(0, 30) + "..."
                : input;
        saveThreads();
    }

    const response = await agent.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: input,
                },
            ],
        },
        {
            configurable: {
                thread_id: currentThreadId,
            },
        }
    );

    const lastMessage = response.messages.at(-1);

    console.log("\nAgent:", lastMessage?.content, "\n");
}

// 8. Main CLI application
export async function startChat(): Promise<void> {
    const rl = createInterface({
        input: stdin,
        output: stdout,
    });

    console.log("\n================================");
    console.log("       SIMPLE CHAT AGENT");
    console.log("================================");

    // Load existing conversations from disk
    const savedThreads = loadThreads();
    threads.length = 0;
    threads.push(...savedThreads);

    if (threads.length > 0) {
        const latestThread = threads[threads.length - 1];
        currentThreadId = latestThread.id;
        console.log(`\nResumed conversation: "${latestThread.title}"`);
        console.log(`Thread ID: ${currentThreadId}`);
    } else {
        const firstThread = createThread();
        currentThreadId = firstThread.id;
        console.log("\nA new conversation has been created.");
        console.log(`Thread ID: ${currentThreadId}`);
    }

    console.log("\nAvailable commands:");
    console.log("/new       - Create a new conversation");
    console.log("/switch    - Switch conversation");
    console.log("/threads   - List conversations");
    console.log("/history   - Show current history");
    console.log("/exit      - Exit application\n");

    try {
        while (true) {
            const input = await rl.question("You: ");

            const command = input.trim().toLowerCase();

            // Exit application
            if (command === "/exit" || command === "exit") {
                console.log("\nGoodbye!");
                break;
            }

            // Create new conversation
            if (command === "/new") {
                const newThread = createThread();

                currentThreadId = newThread.id;

                console.log("\nNew conversation created!");
                console.log(`Thread ID: ${currentThreadId}\n`);

                continue;
            }

            // List conversations
            if (command === "/threads") {
                listThreads();
                continue;
            }

            // Switch conversation
            if (command === "/switch") {
                await switchThread(rl);
                continue;
            }

            // Show current conversation history
            if (command === "/history") {
                await showHistory();
                continue;
            }

            // Ignore empty messages
            if (!input.trim()) {
                continue;
            }

            // Send normal message to the agent
            try {
                console.log("\nAgent: Thinking...\n");

                await sendMessage(input);
            } catch (error) {
                console.error("\nAgent error:", error);
            }
        }
    } finally {
        rl.close();
    }
}
