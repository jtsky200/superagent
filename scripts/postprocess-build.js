const fs = require('fs');
const path = require('path');

console.log('🔄 Post-processing build for Firebase App Hosting...');

// Ensure the out directory exists and has the correct structure
const outDir = path.join(__dirname, '../frontend/out');
const standaloneDir = path.join(__dirname, '../frontend/.next/standalone');

// Create a simple routes-manifest.json if it doesn't exist
const routesManifestPath = path.join(standaloneDir, '.next/routes-manifest.json');
const routesManifestDir = path.dirname(routesManifestPath);

if (!fs.existsSync(routesManifestDir)) {
  fs.mkdirSync(routesManifestDir, { recursive: true });
}

if (!fs.existsSync(routesManifestPath)) {
  const routesManifest = {
    version: 3,
    pages: {
      '/': {
        regex: '^/$',
        routeKeys: {},
        namedRegex: '^/$'
      }
    },
    dynamicRoutes: [],
    dataRoutes: [],
    rewrites: [],
    redirects: [],
    headers: []
  };
  
  fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
  console.log('✅ Created routes-manifest.json');
}

// Ensure the out directory is properly structured
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('✅ Created out directory');
}

console.log('✅ Build post-processing completed successfully!'); 