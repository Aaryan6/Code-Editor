import axios from "axios";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = "cf13b3989bmshdb533b28a8516c9p103bb0jsn12c65fe36ebd"; // Replace with your RapidAPI key.

export async function POST(req: Request) {
  try {
    const { code, language, testCases } = await req.json();

    // Map language to Judge0 IDs
    const languageId = mapLanguageToJudge0(language);
    if (!languageId) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), {
        status: 400,
      });
    }

    // Send test cases to Judge0
    const results = await Promise.all(
      testCases.map(async (testCase: any) => {
        console.log(code, languageId, testCase);
        const response = await axios.post(
          JUDGE0_API_URL,
          {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": JUDGE0_API_KEY,
            },
          }
        );

        const { token } = response.data;

        // Poll for result
        let result;
        while (true) {
          const { data: status } = await axios.get(
            `${JUDGE0_API_URL}/${token}`,
            {
              headers: { "X-RapidAPI-Key": JUDGE0_API_KEY },
            }
          );

          if (status.status.id > 2) {
            result = status;
            break;
          }
        }

        console.log(result);

        return {
          input: testCase.input,
          yourOutput: result.stdout?.trim(),
          expectedOutput: testCase.expectedOutput,
          isCorrect: result.stdout?.trim() === testCase.expectedOutput,
          error: result.stderr,
        };
      })
    );

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500 }
    );
  }
}

function mapLanguageToJudge0(language: any) {
  const map: any = {
    javascript: 63,
    python: 71,
    java: 62,
    c: 50,
    cpp: 54,
    go: 60,
    ruby: 72,
  };
  return map[language];
}
