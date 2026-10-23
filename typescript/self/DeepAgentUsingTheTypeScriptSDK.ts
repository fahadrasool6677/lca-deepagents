import { createDeepAgent } from "deepagents";
import { tool } from "langchain";
import * as z from "zod";

const searchCompetitors = tool(
  async ({ topic }) => {
    // Integrate your search API here
    return `Research results for ${topic}`;
  },
  {
    name: "search_competitors",
    description: "Research a competitor or market",
    schema: z.object({
      topic: z.string(),
    }),
  }
);

const agent = createDeepAgent({
  tools: [searchCompetitors],
  systemPrompt:
    "Research the requested topic, organize findings, and produce a report.",
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Research three competitors and write a comparison report.",
    },
  ],
});