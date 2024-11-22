"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

type TestCase = {
  input: string;
  yourOutput: string;
  expectedOutput: string;
};

export async function analyzeCodeWithAI(userCode: string, testCase: TestCase) {
  const model = google("models/gemini-1.5-pro-latest");

  const prompt = `As a coding instructor, analyze this code submission for the Two Sum problem:

Problem:
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

User's Code:
${userCode}

Test Case:
Input: ${testCase.input}
Your Output: ${testCase.yourOutput}
Expected Output: ${testCase.expectedOutput}

Please provide:
1. What's wrong with the current implementation
2. Specific suggestions to fix the code
3. A hint about the optimal approach (using a hash map)
Keep the response short and concise and focused on helping the user improve their code.`;

  try {
    const { text } = await generateText({
      model,
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error analyzing code:", error);
    return "Unable to analyze code at the moment. Please try again later.";
  }
}

export async function executePythonCode(code: string, input: any) {
  try {
    const response = await fetch("/api/execute-python", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        input,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to execute Python code");
    }

    const result = await response.json();
    return result.output;
  } catch (error) {
    throw new Error(`Python execution failed: ${error}`);
  }
}
