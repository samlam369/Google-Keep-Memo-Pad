const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXT_DIR = path.join(__dirname, 'chrome-google-keep-full-screen');
const REPO_URL = 'https://github.com/samlam369/chrome-google-keep-full-screen.git';

if (!fs.existsSync(EXT_DIR) || (fs.existsSync(EXT_DIR) && fs.readdirSync(EXT_DIR).length === 0)) {
  console.log('Cloning fullscreen extension fork...');
  execSync(`git clone ${REPO_URL}`, { stdio: 'inherit' });
} else {
  console.log('Fullscreen extension fork already exists. Skipping clone.');
}
