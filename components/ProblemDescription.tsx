import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { problemData } from "@/data/problemData";

export default function ProblemDescription() {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{problemData.id}. {problemData.title}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm">
            {problemData.difficulty}
          </Button>
          {problemData.tags.map((tag, index) => (
            <Button key={index} variant="outline" size="sm">
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="description" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-white px-6 flex-shrink-0">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
        </TabsList>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <TabsContent value="description" className="mt-0">
            <div className="prose max-w-none">
              <p>{problemData.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-0">
            <div className="space-y-4">
              {problemData.examples.map((example, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Example {index + 1}:</p>
                  <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                    <code className="block whitespace-pre">
                      Input: {example.input}
                      {"\n"}Output: {example.output}
                      {example.explanation && `\nExplanation: ${example.explanation}`}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="constraints" className="mt-0">
            <ul className="list-disc pl-5 space-y-2">
              {problemData.constraints.map((constraint, index) => (
                <li key={index}>
                  <code className="whitespace-pre-wrap break-words">{constraint}</code>
                </li>
              ))}
            </ul>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}