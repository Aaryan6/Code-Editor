"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayIcon, SendIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { problemData } from "@/data/problemData";
import { Resizable } from "re-resizable";
import { analyzeCodeWithAI } from "@/app/actions";

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  // Add more languages as needed
];

const themeOptions = [
  { value: "vs-light", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast" },
];

type TestResult = {
  input: string;
  yourOutput: string;
  expectedOutput: string;
  isCorrect?: boolean;
  analysis?: string;
};

export default function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-light");
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your code here
  return [];
}`);
  const [output, setOutput] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [resultBoxHeight, setResultBoxHeight] = useState(200);

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value);
    if (value === "python") {
      setCode(`def two_sum(nums, target):
    # Your code here
    return []`);
    } else if (value === "javascript") {
      setCode(`function twoSum(nums, target) {
  // Your code here
  return [];
}`);
    } else {
      setCode("");
    }
  }, []);

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value);
  }, []);

  const resetCode = () => {
    setCode("");
    setOutput([]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput([]);

    const results = await Promise.all(
      problemData.testCases.map(async (testCase) => {
        try {
          const yourOutput = await executeCode(code, language, testCase.input);
          const result = {
            input: testCase.input,
            yourOutput,
            expectedOutput: testCase.expectedOutput,
            isCorrect: yourOutput === testCase.expectedOutput,
            analysis: "",
          };

          // If output is incorrect, get AI analysis using the server action
          if (result.yourOutput !== result.expectedOutput) {
            result.analysis = await analyzeCodeWithAI(code, {
              input: testCase.input,
              yourOutput: result.yourOutput,
              expectedOutput: testCase.expectedOutput,
            });
          }

          return result;
        } catch (error) {
          return {
            input: testCase.input,
            yourOutput: `Error: ${
              error instanceof Error ? error.message : "Unknown error occurred"
            }`,
            expectedOutput: testCase.expectedOutput,
            isCorrect: false,
            analysis: "",
          };
        }
      })
    );

    setOutput(results);
    setIsRunning(false);
  };

  const executeCode = async (
    code: string,
    language: string,
    input: string
  ): Promise<string> => {
    try {
      const [nums, target] = JSON.parse(`[${input.replace(/\n/g, ",")}]`);

      if (language === "javascript") {
        return eval(`
          ${code}
          JSON.stringify(twoSum(${JSON.stringify(nums)}, ${target}));
        `);
      }

      if (language === "python") {
        const response = await fetch("/api/execute-python", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            input: { nums, target },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to execute Python code");
        }

        const result = await response.json();
        return result.output;
      }

      // Placeholder for other languages
      return `Execution for ${language} is not implemented yet.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Execution error: ${error.message}`);
      }
      throw new Error("Unknown execution error occurred");
    }
  };

  const submitCode = () => {
    toast({
      title: "Code Submitted",
      description: "Your solution has been submitted successfully!",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex gap-2 items-center">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetCode}
            className="gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Reset code"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={runCode}
            disabled={isRunning}
            className="gap-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
          >
            <PlayIcon className="w-4 h-4" />
            Run
          </Button>
          <Button
            onClick={submitCode}
            className="gap-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <SendIcon className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      <Resizable
        size={{ height: resultBoxHeight, width: "100%" }}
        onResizeStop={(e, direction, ref, d) => {
          setResultBoxHeight(resultBoxHeight + d.height);
        }}
        minHeight={100}
        maxHeight={500}
        enable={{ top: true }}
      >
        <div className="border-t border-gray-200 bg-white overflow-y-auto h-full">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700">
              Test Results
            </h3>
            <div className="space-y-4">
              {output.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono p-2 rounded ${
                    result.isCorrect ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="mb-1">
                    <strong>Input:</strong> {result.input}
                  </div>
                  <div className="mb-1">
                    <strong>Your Output:</strong> {result.yourOutput}
                  </div>
                  <div className="mb-1">
                    <strong>Expected Output:</strong> {result.expectedOutput}
                  </div>
                  {!result.isCorrect && result.analysis && (
                    <div className="mt-3 p-3 bg-white rounded border border-red-200">
                      <strong className="text-red-600">AI Analysis:</strong>
                      <div className="mt-1 text-gray-700 whitespace-pre-wrap">
                        {result.analysis}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {output.length === 0 && (
                <div className="text-gray-500 text-sm">
                  Run your code to see test results
                </div>
              )}
            </div>
          </div>
        </div>
      </Resizable>
    </div>
  );
}
