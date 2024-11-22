import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, testCase } = await request.json();

    if (!code || !testCase) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const model = google("models/gemini-1.5-pro-latest");

    const prompt = `Analyze this Two Sum solution:
${code}

Test Case - Input: ${testCase.input}, Your Output: ${testCase.yourOutput}, Expected: ${testCase.expectedOutput}

Provide a 2-3 line response focusing only on the main issue and a quick hint about using a hash map for O(n) time complexity.`;

    const { text } = await generateText({
      model,
      prompt,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error("Error in /api/analyze-code:", error);
    return Response.json(
      {
        error: "Failed to analyze code",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
