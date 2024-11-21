// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// import { writeFile, mkdir } from "fs/promises";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";

// export async function POST(request: Request) {
//   try {
//     const { code, input } = await request.json();

//     // Create the tmp directory if it doesn't exist
//     const tmpDir = path.join(process.cwd(), "tmp");
//     await mkdir(tmpDir, { recursive: true });

//     // Create a unique filename for this execution
//     const filename = `temp_${uuidv4()}.py`;
//     const filepath = path.join(tmpDir, filename);

//     // Prepare the Python code with necessary imports and input
//     const fullCode = `
// import json
// import sys
// ${code}

// # Execute the function with provided input
// result = two_sum(${JSON.stringify(input.nums)}, ${input.target})
// print(json.dumps(result))
// `;

//     // Write the code to a temporary file
//     await writeFile(filepath, fullCode);

//     // Execute the Python code
//     const output = await new Promise((resolve, reject) => {
//       exec(`python ${filepath}`, (error, stdout, stderr) => {
//         // Clean up the temporary file
//         exec(`rm ${filepath}`);

//         if (error) {
//           reject(stderr || error.message);
//           return;
//         }
//         resolve(stdout.trim());
//       });
//     });

//     return NextResponse.json({ output });
//   } catch (error) {
//     console.error("Python execution error:", error);
//     return NextResponse.json(
//       { error: "Failed to execute Python code" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supported languages mapping
const languageExecutionTemplates = {
  python: (code: string, input: any) => `
import json
import sys

${code}

# Execute the function with provided input
result = two_sum(${JSON.stringify(input.nums)}, ${input.target})
print(json.dumps(result))
  `,
  javascript: (code: string, input: any) => `
${code}

console.log(JSON.stringify(twoSum(${JSON.stringify(input.nums)}, ${input.target})))
  `,
  java: (code: string, input: any) => `
public class Solution {
    ${code}

    public static void main(String[] args) {
        int[] nums = ${JSON.stringify(input.nums)};
        int target = ${input.target};
        int[] result = new Solution().twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}
  `,
};

export async function POST(request: Request) {
  try {
    const { code, input } = await request.json();

    // Validate input
    if (!code || !input) {
      return NextResponse.json(
        { error: "Missing code, language, or input" },
        { status: 400 }
      );
    }

    // Execute code using OpenAI's API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a code execution assistant. 
          Execute the provided code in the specified language with the given input.
          Ensure you return only the output of the code execution.
          For languages like Python or JavaScript, you can use the language's runtime.
          For compiled languages, simulate the compilation and execution.`,
        },
        {
          role: "user",
          content: `Language: python
Input: ${JSON.stringify(input)}
Code: ${code}

Please execute this code and return the exact output as it would be printed/returned.`,
        },
      ],
      max_tokens: 300,
      temperature: 0,
    });

    const output = completion.choices[0].message.content?.trim() || "";
    console.log(output);
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}

// API route for AI-powered code analysis
export async function analyzeCodeWithAI(
  code: string,
  testCaseInfo: {
    input: string;
    yourOutput: string;
    expectedOutput: string;
  }
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a coding assistant that helps developers understand why their code is not producing the expected output.
          Provide a clear, concise, and constructive analysis of the code's issues.
          Focus on:
          1. Identifying the specific problem in the implementation
          2. Explaining why the current implementation fails
          3. Suggesting a corrected approach
          4. Keeping the explanation beginner-friendly`,
        },
        {
          role: "user",
          content: `Code:
\`\`\`
${code}
\`\`\`

Test Case Details:
- Input: ${testCaseInfo.input}
- Your Output: ${testCaseInfo.yourOutput}
- Expected Output: ${testCaseInfo.expectedOutput}

Please analyze why the code is not producing the correct output and provide guidance on how to fix it.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return (
      completion.choices[0].message.content?.trim() ||
      "No specific analysis could be generated."
    );
  } catch (error) {
    console.error("AI analysis error:", error);
    return "An error occurred during AI code analysis.";
  }
}

// Note: You'll need to install the OpenAI package
// npm install openai
