
import CodeEditor from "@/components/CodeEditor";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Python Code Playground</h1>
      <p className="text-muted-foreground mb-6">
        Write and execute Python code securely in an isolated Docker container
      </p>
      
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Features</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Execute Python 3.11 code securely in isolated containers</li>
          <li>Install custom dependencies from PyPI</li>
          <li>Real-time syntax highlighting and code completion</li>
          <li>View standard output and error streams</li>
        </ul>
      </div>
      
      <CodeEditor />
    </div>
  );
};

export default Index;
