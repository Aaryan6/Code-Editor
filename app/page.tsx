import CodeEditor from '@/components/CodeEditor';
import ProblemDescription from '@/components/ProblemDescription';

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-50">
      {/* Left Panel - Problem Description */}
      <div className="w-[45%] h-full border-r border-gray-200 bg-white overflow-y-auto">
        <ProblemDescription />
      </div>

      {/* Right Panel - Code Editor */}
      <div className="flex-1 h-full">
        <CodeEditor />
      </div>
    </main>
  );
}