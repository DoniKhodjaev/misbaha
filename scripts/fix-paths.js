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
  
  // ВАЖНО: Сначала исправляем двойные пути типа /assets/assets/ -> /misbaha/assets/assets/
  // Делаем это ДО общей замены /assets/
  content = content.replace(/\/assets\/assets\//g, '/misbaha/assets/assets/');
  
  // Затем заменяем прямые пути без кавычек (но не те, что уже начинаются с /misbaha)
  content = content.replace(/\/(?!misbaha\/)assets\//g, '/misbaha/assets/');
  content = content.replace(/\/(?!misbaha\/)_expo\//g, '/misbaha/_expo/');
  content = content.replace(/\/(?!misbaha\/)favicon\.ico/g, '/misbaha/favicon.ico');
  
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
      // Пропускаем пути, которые уже начинаются с /misbaha
      if (filePath.startsWith('misbaha/')) {
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

// Копируем иконку в dist (всегда, чтобы она была актуальной)
const iconSourcePath = path.join(__dirname, '..', 'assets', 'ico.png');
const iconDestPath = path.join(distPath, 'assets', 'assets', 'ico.png');
const iconDestDir = path.join(distPath, 'assets', 'assets');

if (fs.existsSync(iconSourcePath)) {
  if (!fs.existsSync(iconDestDir)) {
    fs.mkdirSync(iconDestDir, { recursive: true });
  }
  fs.copyFileSync(iconSourcePath, iconDestPath);
  console.log('✅ Copied ico.png to dist/assets/assets/');
} else {
  console.warn('⚠️  Warning: ico.png not found in assets folder');
}

// Добавляем мета-теги для iOS PWA
console.log('🍎 Adding iOS PWA meta tags...');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Удаляем старые мета-теги для iOS если они есть
htmlContent = htmlContent.replace(/<meta name="apple-mobile-web-app-[^"]*"[^>]*>/g, '');
htmlContent = htmlContent.replace(/<link rel="apple-touch-icon[^"]*"[^>]*>/g, '');
htmlContent = htmlContent.replace(/<meta name="viewport"[^>]*>/g, '');

// Добавляем правильные мета-теги перед </head>
// Используем apple-touch-icon-precomposed чтобы избежать белой обводки
const iosMetaTags = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Misbaha">
    <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/misbaha/assets/assets/ico.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/misbaha/assets/assets/ico.png">
    <link rel="apple-touch-icon" sizes="512x512" href="/misbaha/assets/assets/ico.png">`;

htmlContent = htmlContent.replace('</head>', `${iosMetaTags}\n  </head>`);
fs.writeFileSync(indexPath, htmlContent, 'utf8');
console.log('✅ Added iOS PWA meta tags to index.html');

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
