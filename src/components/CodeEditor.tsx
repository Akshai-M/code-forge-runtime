
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_CODE = `# Sample Python code
def greet(name):
    return f"Hello, {name}!"

# Main function
if __name__ == "__main__":
    print(greet("World"))
    print("Current Python version:")
    import sys
    print(sys.version)
`;

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const CodeEditor = () => {
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [dependencies, setDependencies] = useState<string>("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to run");
      return;
    }

    setLoading(true);
    try {
      // Parse dependencies
      const deps = dependencies.split(",").map(dep => dep.trim()).filter(dep => dep);
      
      // Call the actual backend API
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          dependencies: deps
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

      if (data.exitCode === 0) {
        toast.success("Code executed successfully");
      } else {
        toast.error("Code execution failed");
      }
    } catch (error) {
      console.error("Error executing code:", error);
      setResult({
        stdout: "",
        stderr: error instanceof Error ? error.message : "An unexpected error occurred",
        exitCode: 1
      });
      toast.error("Failed to execute code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Dependencies (comma separated)</label>
          <Input
            placeholder="requests, numpy, pandas"
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          onClick={runCode} 
          disabled={loading}
          className="mt-4 md:mt-0 w-full md:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run Code"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="flex flex-col">
          <div className="text-sm font-medium mb-1">Python Code</div>
          <div className="editor-container border border-border">
            <Editor
              height="100%"
              defaultLanguage="python"
              defaultValue={SAMPLE_CODE}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-sm font-medium mb-1">Output</div>
          <div className="bg-card border border-border output-container flex-grow">
            {result ? (
              <>
                {result.stdout && <pre>{result.stdout}</pre>}
                {result.stderr && <pre className="output-error">{result.stderr}</pre>}
                <Separator className="my-2" />
                <div className={result.exitCode === 0 ? "output-success" : "output-error"}>
                  Exit code: {result.exitCode}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                Code output will appear here after execution
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Code is executed securely in an isolated Docker container on the server.
      </div>
    </div>
  );
};

export default CodeEditor;
