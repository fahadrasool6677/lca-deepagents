

import { systemPrompt } from "./prompt";
import { model } from "./model";
import { calculator } from "./tools";
import { createDeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const checkPointer = new MemorySaver();

export const agent = createDeepAgent({
    model: model,
    systemPrompt: systemPrompt,
    tools: [calculator],
    checkpointer: checkPointer,
});
