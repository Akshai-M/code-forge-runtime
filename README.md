
# Python Code Playground

A secure environment to write and execute Python code in isolated Docker containers.

## Features

- Python 3.11 execution environment
- Custom dependency installation
- Secure execution in isolated Docker containers
- Syntax highlighting and code completion

## Prerequisites

- Node.js (v14 or newer)
- Docker
- npm or yarn

## Setup and Running

### 1. Start the backend server

```bash
cd backend
npm install
npm start
```

The backend will start on port 3001.

### 2. Start the frontend

In a new terminal:

```bash
npm install
npm run dev
```

The frontend will be available at http://localhost:8080

## Security Considerations

- Code is executed in isolated Docker containers
- Network access is disabled inside containers
- Containers are removed after execution
- Temporary files are cleaned up automatically

## Important Notes

- Execution has a timeout of 30 seconds
- Maximum memory is limited by Docker defaults

## Development

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- Container: Python 3.11 Docker image
