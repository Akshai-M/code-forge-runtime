
import CodeEditor from "@/components/CodeEditor";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Python Code Playground</h1>
      <p className="text-muted-foreground mb-6">
        Write and execute Python code with custom dependencies
      </p>
      
      <CodeEditor />
    </div>
  );
};

export default Index;
