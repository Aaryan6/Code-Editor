import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = "cf13b3989bmshdb533b28a8516c9p103bb0jsn12c65fe36ebd"; // Replace with your API key

export async function POST(req: NextRequest) {
  try {
    const { source_code, language_id, test_cases } = await req.json();

    // Validate the request payload
    if (!source_code || !language_id || !Array.isArray(test_cases)) {
      return NextResponse.json(
        {
          error:
            "Invalid request: source_code, language_id, and test_cases are required.",
        },
        { status: 400 }
      );
    }

    const testResults = [];

    // Process each test case
    for (const testCase of test_cases) {
      const { input, expectedOutput } = testCase;

      // Construct payload for Judge0
      const payload = {
        source_code,
        language_id,
        stdin: input,
        expected_output: expectedOutput,
      };

      // Submit code to Judge0
      const submissionResponse = await axios.post(JUDGE0_API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
        },
        params: { base64_encoded: "false", wait: "true" }, // Ensure we wait for the result
      });

      const result = submissionResponse.data;

      // Collect results for each test case
      testResults.push({
        input,
        expectedOutput,
        actualOutput: result.stdout ? result.stdout.trim() : null,
        isCorrect:
          result.status.id === 3 &&
          result.stdout?.trim() === expectedOutput.trim(),
        error: result.stderr || result.compile_output || null,
        status: result.status.description,
      });
    }

    // Respond with the results
    return NextResponse.json({ testResults }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/run-code:", error);

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
