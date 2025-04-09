// Simple script to start the Next.js server with proper environment variables
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Default port (can be overridden with PORT environment variable)
const PORT = process.env.PORT || 3000;

console.log('Starting Next.js standalone server...');
console.log(`Server will be available at: http://localhost:${PORT}`);

// Check if the standalone server file exists
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('\x1b[31mError: Standalone server file not found!\x1b[0m');
  console.error(`Expected to find server at: ${serverPath}`);
  console.error('Make sure you\'ve built the project with "npm run build" first.');
  process.exit(1);
}

// Start the server process with the PORT environment variable set
const server = spawn('node', [serverPath], {
  env: { ...process.env, PORT },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error(`\x1b[31mServer failed to start: ${err.message}\x1b[0m`);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\x1b[31mServer exited with code ${code}\x1b[0m`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});
