// Simple development server for Next.js
const { execSync } = require('child_process');
const http = require('http');

// Port to check
const PORT = process.env.PORT || 3000;

// Check if the port is in use
function isPortInUse() {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
      server.close();
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(PORT);
  });
}

async function startServer() {
  try {
    console.log(`Checking if port ${PORT} is available...`);
    
    // Check if port is already in use
    const portInUse = await isPortInUse();
    if (portInUse) {
      console.log(`\x1b[31mERROR: Port ${PORT} is already in use!\x1b[0m`);
      console.log('Try running on a different port:');
      console.log(`PORT=3001 node dev-server.js`);
      process.exit(1);
    }
    
    // Start Next.js development server
    console.log(`\x1b[32mStarting Next.js development server on port ${PORT}...\x1b[0m`);
    console.log('Press Ctrl+C to stop the server.\n');
    
    // Use execSync to run the command and show output directly
    execSync(`npx next dev -p ${PORT}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\x1b[31mFailed to start server: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

startServer();
