import { NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(request: Request) {
  try {
    const { code, input } = await request.json();

    // Create a unique filename for this execution
    const filename = `temp_${uuidv4()}.py`;
    const filepath = path.join(process.cwd(), "tmp", filename);

    // Prepare the Python code with necessary imports and input
    const fullCode = `
import json
import sys
${code}

# Execute the function with provided input
result = two_sum(${JSON.stringify(input.nums)}, ${input.target})
print(json.dumps(result))
`;

    // Write the code to a temporary file
    await writeFile(filepath, fullCode);

    // Execute the Python code
    const output = await new Promise((resolve, reject) => {
      exec(`python ${filepath}`, (error, stdout, stderr) => {
        // Clean up the temporary file
        exec(`rm ${filepath}`);

        if (error) {
          reject(stderr || error.message);
          return;
        }
        resolve(stdout.trim());
      });
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Python execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute Python code" },
      { status: 500 }
    );
  }
}
