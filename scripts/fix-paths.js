const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Заменяем абсолютные пути на пути с префиксом /misbaha
// Обрабатываем пути начинающиеся с /, но не с /misbaha
html = html.replace(/(src|href)=["']\/(?!misbaha)([^"'?#]+)["']/g, (match, attr, filePath) => {
  // Пропускаем пути, которые уже правильные или являются внешними ссылками
  if (filePath.startsWith('http') || filePath.startsWith('//')) {
    return match;
  }
  return `${attr}="/misbaha${filePath}"`;
});

// Исправляем дублирование префикса
html = html.replace(/\/misbaha\/misbaha\//g, '/misbaha/');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Fixed paths in index.html for GitHub Pages');


