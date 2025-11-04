const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Заменяем пути к ресурсам на правильные с префиксом /misbaha
html = html.replace(/(src|href)="\/(?!misbaha)([^"]+)"/g, '$1="/misbaha/$2"');
html = html.replace(/(src|href)="\/misbaha\/misbaha\//g, '$1="/misbaha/');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Fixed paths in index.html for GitHub Pages');

