import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userCode, testCase } = await request.json();
    console.log(userCode, testCase);
    if (!userCode || !testCase) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    const { text } = await generateText({
      model,
      prompt,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error("Error in /api/analyze-code:", error);
    return Response.json({ error: "Failed to analyze code" }, { status: 500 });
  }
}
