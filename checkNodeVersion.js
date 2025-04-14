const https = require('https');

console.log(`Current Node.js version: ${process.version}`);

// Function to get the latest Node.js version
function getLatestNodeVersion() {
  return new Promise((resolve, reject) => {
    https.get('https://nodejs.org/dist/index.json', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const versions = JSON.parse(data);
          // Filter for stable versions (even major versions)
          const stableVersions = versions.filter(v => !v.version.includes('rc') && 
            parseInt(v.version.substring(1).split('.')[0]) % 2 === 0);
          
          if (stableVersions.length > 0) {
            // Latest stable version
            const latest = stableVersions[0].version;
            // Latest LTS version
            const lts = stableVersions.find(v => v.lts)?.version || 'unknown';
            
            resolve({ latest, lts });
          } else {
            reject(new Error('No stable versions found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Check if current is latest
getLatestNodeVersion()
  .then(({ latest, lts }) => {
    console.log(`Latest Node.js version: ${latest}`);
    console.log(`Latest LTS version: ${lts}`);
    
    const currentVersion = process.version;
    if (currentVersion === latest) {
      console.log('✅ You are using the latest Node.js version!');
    } else {
      console.log(`ℹ️ You might consider updating to ${latest} if needed.`);
      console.log('For production applications, the LTS version is recommended.');
    }
  })
  .catch(error => {
    console.error('Error checking for latest version:', error.message);
  });
