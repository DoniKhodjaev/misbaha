const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
const originalHtml = html;

// Заменяем абсолютные пути на пути с префиксом /misbaha
// Обрабатываем пути начинающиеся с /, но не с /misbaha
html = html.replace(/(src|href)=["']\/(?!misbaha)([^"'?#]+)["']/g, (match, attr, filePath) => {
  // Пропускаем пути, которые уже правильные или являются внешними ссылками
  if (filePath.startsWith('http') || filePath.startsWith('//')) {
    return match;
  }
  return `${attr}="/misbaha${filePath}"`;
});

// Также обрабатываем пути без кавычек (в HTML комментариях или других местах)
html = html.replace(/(["'])\/(?!misbaha)([^"'?#]+)\1/g, (match, quote, filePath) => {
  if (filePath.startsWith('http') || filePath.startsWith('//')) {
    return match;
  }
  return `${quote}/misbaha${filePath}${quote}`;
});

// Исправляем дублирование префикса
html = html.replace(/\/misbaha\/misbaha\//g, '/misbaha/');

// Проверяем, были ли изменения
if (html !== originalHtml) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Fixed paths in index.html for GitHub Pages');
  
  // Выводим информацию о замененных путях
  const matches = html.match(/\/misbaha\/[^"']+/g);
  if (matches) {
    console.log('Found paths with /misbaha prefix:', matches.slice(0, 5).join(', '));
  }
} else {
  console.log('⚠️  No paths were changed in index.html');
  console.log('Checking if paths already contain /misbaha...');
  
  // Проверяем наличие путей с /misbaha
  if (html.includes('/misbaha/')) {
    console.log('✅ Paths already contain /misbaha prefix');
  } else {
    console.log('❌ No /misbaha prefix found in paths');
    console.log('Sample paths found:', html.match(/(src|href)=["']\/[^"']+["']/g)?.slice(0, 3));
  }
}


