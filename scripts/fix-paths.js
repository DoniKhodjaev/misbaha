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

console.log('🔍 Analyzing index.html...');

// Находим все пути перед заменой
const beforePaths = html.match(/(src|href)=["']\/[^"']+["']/g);
if (beforePaths) {
  console.log('Paths found before replacement:', beforePaths.slice(0, 5).join(', '));
}

// ВАЖНО: Сначала исправляем уже неправильно замененные пути
// (типа /misbaha_expo или /misbahafavicon)
html = html.replace(/\/misbaha([^\/"])/g, '/misbaha/$1');

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

console.log('🔍 Analyzing index.html...');

// Находим все пути перед заменой
const beforePaths = html.match(/(src|href)=["']\/[^"']+["']/g);
if (beforePaths) {
  console.log('Paths found before replacement:', beforePaths.slice(0, 5).join(', '));
}

// ВАЖНО: Сначала исправляем уже неправильно замененные пути
// (типа /misbaha_expo или /misbahafavicon)
// Исправляем пути типа /misbaha_expo -> /misbaha/_expo
html = html.replace(/\/misbaha([_a-zA-Z])/g, '/misbaha/$1');
// Исправляем пути типа /misbahafavicon -> /misbaha/favicon
html = html.replace(/\/misbahafavicon/g, '/misbaha/favicon');

// Затем заменяем абсолютные пути на пути с префиксом /misbaha/
// Обрабатываем пути начинающиеся с /, но не с /misbaha/
html = html.replace(/(src|href)=["']\/(?!misbaha\/)([^"'?#]+)["']/g, (match, attr, filePath) => {
  // Пропускаем пути, которые уже правильные или являются внешними ссылками
  if (filePath.startsWith('http') || filePath.startsWith('//')) {
    return match;
  }
  // Добавляем слеш после /misbaha
  const newPath = `${attr}="/misbaha/${filePath}"`;
  console.log(`  Replacing: ${match} -> ${newPath}`);
  return newPath;
});

// Исправляем дублирование префикса
html = html.replace(/\/misbaha\/misbaha\//g, '/misbaha/');

// Проверяем, были ли изменения
if (html !== originalHtml) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Fixed paths in index.html for GitHub Pages');
  
  // Выводим информацию о замененных путях
  const afterPaths = html.match(/\/misbaha\/[^"']+/g);
  if (afterPaths) {
    console.log('Paths after replacement:', afterPaths.slice(0, 5).join(', '));
  }
} else {
  console.log('⚠️  No paths were changed in index.html');
  console.log('Checking if paths already contain /misbaha...');
  
  // Проверяем наличие путей с /misbaha
  if (html.includes('/misbaha/')) {
    console.log('✅ Paths already contain /misbaha prefix');
  } else {
    console.log('❌ No /misbaha prefix found in paths');
    const samplePaths = html.match(/(src|href)=["']\/[^"']+["']/g);
    if (samplePaths) {
      console.log('Sample paths found:', samplePaths.slice(0, 5).join(', '));
    } else {
      console.log('No paths found in HTML');
    }
  }
}

// Исправляем дублирование префикса
html = html.replace(/\/misbaha\/misbaha\//g, '/misbaha/');

// Проверяем, были ли изменения
if (html !== originalHtml) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Fixed paths in index.html for GitHub Pages');
  
  // Выводим информацию о замененных путях
  const afterPaths = html.match(/\/misbaha\/[^"']+/g);
  if (afterPaths) {
    console.log('Paths after replacement:', afterPaths.slice(0, 5).join(', '));
  }
} else {
  console.log('⚠️  No paths were changed in index.html');
  console.log('Checking if paths already contain /misbaha...');
  
  // Проверяем наличие путей с /misbaha
  if (html.includes('/misbaha/')) {
    console.log('✅ Paths already contain /misbaha prefix');
  } else {
    console.log('❌ No /misbaha prefix found in paths');
    const samplePaths = html.match(/(src|href)=["']\/[^"']+["']/g);
    if (samplePaths) {
      console.log('Sample paths found:', samplePaths.slice(0, 5).join(', '));
    } else {
      console.log('No paths found in HTML');
    }
  }
}


