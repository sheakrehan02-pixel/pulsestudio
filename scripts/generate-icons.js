// Simple script to create placeholder icons
// In production, replace these with proper designed icons

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const iconSvg = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="40" fill="#3b82f6"/>
  <path d="M96 48L144 60V132L96 144V48Z" fill="white" opacity="0.9"/>
  <circle cx="72" cy="144" r="12" fill="white" opacity="0.9"/>
  <circle cx="144" cy="132" r="12" fill="white" opacity="0.9"/>
  <path d="M96 48L48 60V132L96 144V48Z" fill="white" opacity="0.7"/>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icon files (using SVG for now - browsers support SVG in manifest)
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), iconSvg);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), iconSvg.replace('192', '512').replace('192', '512'));

console.log('Icons generated!');

