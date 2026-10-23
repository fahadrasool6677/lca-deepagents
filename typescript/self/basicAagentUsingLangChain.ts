import { createAgent, tool } from "langchain";
import * as z from "zod";

const getOrder = tool(
  async ({ orderId }) => {
    // Fetch order from your database
    return `Order ${orderId}: shipped`;
  },
  {
    name: "get_order",
    description: "Get an order's status",
    schema: z.object({
      orderId: z.string(),
    }),
  }
);

const agent = createAgent({
  model: "openai:gpt-4.1",
  tools: [getOrder],
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "Check order 123" },
  ],
});