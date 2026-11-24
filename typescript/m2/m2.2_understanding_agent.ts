
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { context } from "langchain";
import {
    CompositeBackend,
    StateBackend,
    createDeepAgent,
} from "deepagents";

import { model } from "../models.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a directory for the response files.
const responseDir = join(__dirname, "responses");

mkdirSync(responseDir, { recursive: true });

// Create the agent.
const agent = createDeepAgent({
    model,

    backend: new CompositeBackend(
        new StateBackend(),
        {}
    ),

    systemPrompt: `
    You are a teaching assistant helping a beginner understand
    DeepAgents concepts.

    Your responsibilities:

    1. Explain concepts in very simple English.
    2. Use practical examples.
    3. Explain code step by step when provided.
    4. Avoid unnecessary technical terminology.
    5. Include a short summary at the end.

    IMPORTANT:
    After preparing your explanation, save the complete
    response as a Markdown file using the filesystem tools.

    Use this filename:
    /understanding-response.md

    Do not just tell the user that you saved the file.
    Actually write the file using the filesystem tool.
  `,
});

// Ask your question.
const result = await agent.invoke(
    {
        messages: [
            {
                role: "user",
                content: context`
          Explain the difference between:

          1. Backend
          2. CompositeBackend
          3. StateBackend
          4. FilesystemBackend

          Explain using simple real-world examples.
          Also explain how these components work together.
        `,
            },
        ],
    },
    {
        configurable: {
            thread_id: "understanding-agent-01",
        },
    }
);

// Display the final response.
console.log(result.messages.at(-1)?.text);
