import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import { z } from "zod";
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";

import { model } from "../models.js";

const fileURL = import.meta.url;
const filePath = fileURLToPath(fileURL);

const __dirname = dirname(filePath);
const dbPath = join(__dirname, "..", "data", "students_test.db");
const db = new DatabaseSync(dbPath);


const studentPercentageCalculatorTool = tool(
  ({ query }) => {
    console.log("Student SQL:", query);
    if (!/^\s*SELECT\b/i.test(query)) {
      return "Error: only a SQLite SELECT query is allowed.";
    }

    try {
      const rows = db.prepare(query).all();
      return JSON.stringify(rows);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Student SQL error:", message);
      return `SQL error: ${message}. Send a valid SQLite SELECT query against the students table.`;
    }
  },
  {
    name: "studentPercentageCalculatorTool",
    description: "Run a read-only SQLite SELECT query against the students table to retrieve student marks and percentages.",
    schema: z.object({
      query: z.string().describe("A valid SQLite SELECT statement. Do not put natural-language instructions here."),
    }),
  }
)

const SYSTEM_PROMPT = `You are a student marks analyst. Use the studentPercentageCalculatorTool for database questions.

The students table has these columns: id, name, roll_number, english_marks, mathematics_marks, science_marks, computer_science_marks, urdu_marks, social_studies_marks, total_marks, maximum_marks, percentage.

Pass only a valid SQLite SELECT statement as the tool's query. Never put natural-language instructions in the query. For the first five students, order by id and use LIMIT 5. Return the marks and percentage fields relevant to the user's request.`;

const agent = createDeepAgent({
  model,
  name: "Homework_Agent",
  tools: [studentPercentageCalculatorTool],
  systemPrompt: SYSTEM_PROMPT,
});

const result = await agent.invoke({
  messages: [{
    role: "user",
    content: "Give me the marks for first five students and thir names? "
  }],
});

console.log(result.messages.at(-1)?.text);
