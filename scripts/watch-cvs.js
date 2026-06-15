#!/usr/bin/env node
// I watch data/cv.yml for changes and regenerate all CV HTML files automatically so I never need to run the generate script manually during development.
/**
 * CV Watcher - Auto-regenerates CVs when cv.yml changes
 * Run during development: npm run watch-cvs
 * 
 * This watches the data/cv.yml file and automatically regenerates
 * all CV HTML files whenever you save changes.
 */

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const CV_YML_PATH = path.join(__dirname, '..', 'data', 'cv.yml');

console.log('👀 Watching data/cv.yml for changes...');
console.log('Press Ctrl+C to stop\n');

// Watch the cv.yml file
const watcher = chokidar.watch(CV_YML_PATH, {
  persistent: true,
  ignoreInitial: true,
});

let isRegenerating = false;

watcher.on('change', async () => {
  if (isRegenerating) return;
  isRegenerating = true;
  
  console.log(`[${new Date().toLocaleTimeString()}] 📝 cv.yml changed, regenerating CVs...`);
  
  exec('node scripts/generate-cvs.js', (error, stdout, stderr) => {
    isRegenerating = false;
    
    if (error) {
      console.error('❌ Error regenerating CVs:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    
    console.log(stdout);
    console.log(`[${new Date().toLocaleTimeString()}] ✅ CVs updated!\n`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  watcher.close();
  process.exit(0);
});
