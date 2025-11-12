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
  
  // ВАЖНО: Обрабатываем только явные пути к файлам в строках
  // Игнорируем регулярные выражения полностью
  
  // 1. Исправляем пути в HTML-атрибутах (src, href) - ПЕРВЫМ ДЕЛОМ
  // Это самый безопасный способ, так как мы точно знаем контекст
  content = content.replace(/(src|href)=(["'])\/(?!misbaha\/)(?!https?:\/\/)((?:assets|_expo|favicon)[^"']*)\2/gi, 
    (match, attr, quote, fullPath) => {
      if (match.includes('/misbaha/')) {
        return match;
      }
      // Сохраняем полный путь как есть
      return `${attr}=${quote}/misbaha/${fullPath}${quote}`;
    }
  );
  
  // 2. Исправляем пути в строках с расширениями файлов (явные пути к ресурсам)
  // Обрабатываем пути в одинарных кавычках (с поддержкой поддиректорий)
  content = content.replace(/(['"])\/(?!misbaha\/)(?!https?:\/\/)((?:assets|_expo|favicon)[^'"]*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|mp3|woff|ttf|woff2))\1/g, 
    (match, quote, fullPath) => {
      // Пропускаем, если это уже правильный путь
      if (match.includes('/misbaha/')) {
        return match;
      }
      // Заменяем путь
      return `${quote}/misbaha/${fullPath}${quote}`;
    }
  );
  
  // 3. Обрабатываем пути в обратных кавычках (только для явных путей к файлам)
  content = content.replace(/(`)\/(?!misbaha\/)(?!https?:\/\/)((?:assets|_expo|favicon)[^`]*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|mp3|woff|ttf|woff2))\1/g,
    (match, quote, fullPath) => {
      if (match.includes('/misbaha/')) {
        return match;
      }
      return `${quote}/misbaha/${fullPath}${quote}`;
    }
  );
  
  // 4. Исправляем пути без расширений (только для известных директорий)
  // Только в кавычках и только для известных путей
  content = content.replace(/(['"])\/(?!misbaha\/)(?!https?:\/\/)(assets\/|_expo\/|favicon\.ico)\1/g,
    (match, quote, pathPart) => {
      if (match.includes('/misbaha/')) {
        return match;
      }
      return `${quote}/misbaha/${pathPart}${quote}`;
    }
  );
  
  // 5. Исправляем двойные пути типа /assets/assets/
  content = content.replace(/\/assets\/assets\//g, '/misbaha/assets/assets/');
  
  // Исправляем неправильно замененные пути (восстанавливаем слеши и точки)
  content = content.replace(/\/misbaha([_a-zA-Z])/g, '/misbaha/$1');
  content = content.replace(/\/misbahafavicon/g, '/misbaha/favicon');
  content = content.replace(/faviconico/g, 'favicon.ico');
  content = content.replace(/\/misbaha\/_expojs/g, '/misbaha/_expo/static/js/web/AppEntry-7be7eff48eb1fe14aebef2f001e42a1c.js');
  
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

// Копируем иконку и аудио файл в dist (всегда, чтобы они были актуальными)
const iconSourcePath = path.join(__dirname, '..', 'assets', 'ico.png');
const iconDestPath = path.join(distPath, 'assets', 'assets', 'ico.png');
const audioSourcePath = path.join(__dirname, '..', 'assets', 'bismillah.mp3');
const audioDestPath = path.join(distPath, 'assets', 'assets', 'bismillah.mp3');
const iconDestDir = path.join(distPath, 'assets', 'assets');

if (!fs.existsSync(iconDestDir)) {
  fs.mkdirSync(iconDestDir, { recursive: true });
}

if (fs.existsSync(iconSourcePath)) {
  fs.copyFileSync(iconSourcePath, iconDestPath);
  console.log('✅ Copied ico.png to dist/assets/assets/');
} else {
  console.warn('⚠️  Warning: ico.png not found in assets folder');
}

if (fs.existsSync(audioSourcePath)) {
  fs.copyFileSync(audioSourcePath, audioDestPath);
  console.log('✅ Copied bismillah.mp3 to dist/assets/assets/');
} else {
  console.warn('⚠️  Warning: bismillah.mp3 not found in assets folder');
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
