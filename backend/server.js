
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.post('/api/execute', async (req, res) => {
  const { code, dependencies = [] } = req.body;
  
  console.log('Received code execution request');
  
  if (!code) {
    return res.status(400).json({ 
      stdout: '',
      stderr: 'No code provided',
      exitCode: 1
    });
  }

  // Create unique directory for this execution
  const executionId = uuidv4();
  const executionDir = path.join(tempDir, executionId);
  
  try {
    // Create directory
    fs.mkdirSync(executionDir);
    
    // Write code to file
    const codePath = path.join(executionDir, 'main.py');
    fs.writeFileSync(codePath, code);
    
    // Create requirements.txt if dependencies provided
    if (dependencies.length > 0) {
      const requirementsPath = path.join(executionDir, 'requirements.txt');
      fs.writeFileSync(requirementsPath, dependencies.join('\n'));
    }
    
    console.log(`Executing code in directory: ${executionDir}`);
    console.log(`Dependencies: ${dependencies.join(', ') || 'none'}`);
    
    // Build docker command - handle both with and without dependencies
    let dockerCmd;
    if (dependencies.length > 0) {
      dockerCmd = `docker run --rm -v "${executionDir}:/app" --network none python:3.11 /bin/bash -c "cd /app && pip install -r requirements.txt && python main.py"`;
    } else {
      dockerCmd = `docker run --rm -v "${executionDir}:/app" --network none python:3.11 python /app/main.py`;
    }
    
    console.log(`Running command: ${dockerCmd}`);
    
    // Execute docker command
    exec(dockerCmd, { timeout: 30000 }, (error, stdout, stderr) => {
      // Clean up files
      try {
        fs.rmSync(executionDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Failed to clean up temp files:', cleanupError);
      }
      
      // Determine exit code
      const exitCode = error ? (error.code || 1) : 0;
      
      console.log(`Execution complete with exit code: ${exitCode}`);
      
      res.json({
        stdout,
        stderr,
        exitCode
      });
    });
  } catch (error) {
    // Clean up on error
    try {
      if (fs.existsSync(executionDir)) {
        fs.rmSync(executionDir, { recursive: true });
      }
    } catch (cleanupError) {
      console.error('Failed to clean up temp files:', cleanupError);
    }
    
    console.error('Error executing code:', error);
    res.status(500).json({
      stdout: '',
      stderr: error.message || 'An error occurred while executing the code',
      exitCode: 1
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
