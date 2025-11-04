const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

console.log('🔍 Fixing paths for GitHub Pages...');

// Функция для замены путей в файле
function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Сначала заменяем прямые пути без кавычек (более агрессивная замена)
  content = content.replace(/\/assets\//g, '/misbaha/assets/');
  content = content.replace(/\/_expo\//g, '/misbaha/_expo/');
  content = content.replace(/\/favicon\.ico/g, '/misbaha/favicon.ico');
  
  // Затем заменяем пути в кавычках
  // Обрабатываем пути в одинарных, двойных кавычках и обратных кавычках
  const patterns = [
    // Одинарные и двойные кавычки
    /(['"])\/(?!misbaha\/)(?!https?:\/\/)([^"'?#]+)\1/g,
    // Обратные кавычки
    /(`)\/(?!misbaha\/)(?!https?:\/\/)([^`?#]+)\1/g,
  ];
  
  for (const pattern of patterns) {
    content = content.replace(pattern, (match, quote, filePath) => {
      // Пропускаем пути, которые уже правильные или являются внешними ссылками
      if (!filePath || filePath.startsWith('http') || filePath.startsWith('//')) {
        return match;
      }
      // Определяем тип кавычки
      return `${quote}/misbaha/${filePath}${quote}`;
    });
  }
  
  // Исправляем неправильно замененные пути
  content = content.replace(/\/misbaha([_a-zA-Z])/g, '/misbaha/$1');
  content = content.replace(/\/misbahafavicon/g, '/misbaha/favicon');
  
  // Исправляем дублирование префикса
  content = content.replace(/\/misbaha\/misbaha\//g, '/misbaha/');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Исправляем пути в index.html
let htmlFixed = fixPathsInFile(indexPath);
if (htmlFixed) {
  console.log('✅ Fixed paths in index.html');
}

// Исправляем пути во всех JS файлах
function fixJsFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += fixJsFiles(filePath);
    } else if (file.endsWith('.js')) {
      if (fixPathsInFile(filePath)) {
        fixedCount++;
        console.log(`✅ Fixed paths in ${path.relative(distPath, filePath)}`);
      }
    }
  }
  
  return fixedCount;
}

const jsFilesFixed = fixJsFiles(distPath);
console.log(`✅ Fixed paths in ${jsFilesFixed} JS file(s)`);
console.log('🎉 All paths fixed for GitHub Pages!');
