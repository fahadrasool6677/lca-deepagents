import { z } from "zod";
import { tool } from "@langchain/core/tools";

/**
 * Calculator tool schema defining parameters for mathematical operations.
 */
const calculatorSchema = z.object({
    expression: z
        .string()
        .optional()
        .describe("Mathematical expression to calculate, e.g., '1547 * 38', '42 / 6', '2 ^ 10', or 'sqrt(144)'."),
    operation: z
        .enum(["add", "subtract", "multiply", "divide", "power", "sqrt"])
        .optional()
        .describe("The arithmetic operation: 'add', 'subtract', 'multiply', 'divide', 'power', or 'sqrt'."),
    a: z.number().optional().describe("The first number."),
    b: z.number().optional().describe("The second number."),
});

/**
 * Calculator tool implementation with robust error handling.
 */
export const calculator = tool(
    ({ expression, operation, a, b }) => {
        try {
            // Handle explicit operation and numbers
            if (operation && a !== undefined) {
                switch (operation) {
                    case "add": {
                        if (b === undefined) return "Error: 'b' is required for addition.";
                        return `Result: ${a} + ${b} = ${a + b}`;
                    }
                    case "subtract": {
                        if (b === undefined) return "Error: 'b' is required for subtraction.";
                        return `Result: ${a} - ${b} = ${a - b}`;
                    }
                    case "multiply": {
                        if (b === undefined) return "Error: 'b' is required for multiplication.";
                        return `Result: ${a} * ${b} = ${a * b}`;
                    }
                    case "divide": {
                        if (b === undefined) return "Error: 'b' is required for division.";
                        if (b === 0) {
                            return "Error: Cannot divide by zero. Division by zero is undefined.";
                        }
                        return `Result: ${a} / ${b} = ${a / b}`;
                    }
                    case "power": {
                        if (b === undefined) return "Error: 'b' is required for power operation.";
                        return `Result: ${a} ^ ${b} = ${Math.pow(a, b)}`;
                    }
                    case "sqrt": {
                        if (a < 0) {
                            return "Error: Cannot calculate the square root of a negative number in real numbers.";
                        }
                        return `Result: sqrt(${a}) = ${Math.sqrt(a)}`;
                    }
                }
            }

            // Handle expression string (e.g. "1547 * 38" or "sqrt(144)")
            if (expression) {
                const cleaned = expression.trim();

                // Check for division by zero in expression
                if (/\/0(?!\.)|\/\s*0(?!\d)/.test(cleaned)) {
                    return "Error: Cannot divide by zero. Division by zero is undefined.";
                }

                // Check for sqrt(number)
                const sqrtMatch = cleaned.match(/^sqrt\(\s*(-?\d+(\.\d+)?)\s*\)$/i);
                if (sqrtMatch) {
                    const num = Number(sqrtMatch[1]);
                    if (num < 0) {
                        return "Error: Cannot calculate the square root of a negative number in real numbers.";
                    }
                    return `Result: sqrt(${num}) = ${Math.sqrt(num)}`;
                }

                // Check allowed math characters
                if (!/^[\d\s+\-*/().^%]+$/.test(cleaned)) {
                    return `Error: Invalid characters in mathematical expression '${cleaned}'. Only numbers and basic arithmetic operators are allowed.`;
                }

                const jsExpr = cleaned.replace(/\^/g, "**");
                const calculated = Function(`"use strict"; return (${jsExpr})`)();

                if (!Number.isFinite(calculated)) {
                    return "Error: Calculation resulted in an undefined or infinite value (e.g., division by zero).";
                }

                return `Result: ${cleaned} = ${calculated}`;
            }

            // Fallback if numbers a and b were provided without explicit operation
            if (a !== undefined && b !== undefined) {
                return `Result: ${a} * ${b} = ${a * b}`;
            }

            return "Error: Please provide an expression (e.g., '1547 * 38') or an operation with numbers 'a' and 'b'.";
        } catch (error) {
            return `Tool Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    },
    {
        name: "calculator",
        description:
            "A mathematical calculator for precise arithmetic. Use this whenever performing calculations like addition, subtraction, multiplication, division, powers, or square roots.",
        schema: calculatorSchema,
    }
);
