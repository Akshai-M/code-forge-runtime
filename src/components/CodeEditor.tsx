
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
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate a response
      const deps = dependencies.split(",").map(dep => dep.trim()).filter(dep => dep);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate stdout
      let stdout = "Running code in Python 3.11 container...\n";
      
      if (code.includes("print")) {
        const printStatements = code.match(/print\((.*?)\)/g) || [];
        printStatements.forEach(stmt => {
          const content = stmt.match(/print\((.*?)\)/)?.[1] || "";
          let output = "";
          
          // Simple evaluation of basic print statements
          if (content.startsWith('"') || content.startsWith("'")) {
            output = content.slice(1, -1);
          } else if (content.startsWith("f")) {
            // Very basic f-string simulation
            output = content.slice(2, -1);
            // Replace {name} with "World" for our sample
            output = output.replace("{name}", "World");
          } else if (content === "sys.version") {
            output = "3.11.4 (main, Jul 5 2023, 16:04:27) [GCC 11.2.0]";
          }
          
          stdout += output + "\n";
        });
      }
      
      // If dependencies were specified, show them
      if (deps.length > 0) {
        stdout += `\nInstalled dependencies: ${deps.join(", ")}\n`;
      }

      setResult({
        stdout,
        stderr: "",
        exitCode: 0
      });

      toast.success("Code executed successfully");
    } catch (error) {
      console.error("Error executing code:", error);
      setResult({
        stdout: "",
        stderr: "An error occurred while executing the code",
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
        Note: This is a frontend demo. In a real application, code would be executed securely in a Docker container on the server.
      </div>
    </div>
  );
};

export default CodeEditor;
