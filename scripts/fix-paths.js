const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

console.log('🔍 Fixing paths for GitHub Pages...');

// Функция для замены путей ТОЛЬКО в HTML файлах
function fixPathsInHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Исправляем пути в HTML-атрибутах (src, href)
  // Только для явных путей к файлам
  content = content.replace(/(src|href)=(["'])\/(?!misbaha\/)(?!https?:\/\/)(assets|_expo|favicon)[^"']*\.(js|css|png|jpg|jpeg|gif|svg|ico|mp3|woff|ttf|woff2)\2/gi, 
    (match, attr, quote, pathPart, ext) => {
      if (match.includes('/misbaha/')) {
        return match;
      }
      return `${attr}=${quote}/misbaha/${pathPart}${ext}${quote}`;
    }
  );
  
  // Исправляем двойные пути типа /assets/assets/
  content = content.replace(/\/assets\/assets\//g, '/misbaha/assets/assets/');
  
  // Исправляем пути к директориям в HTML
  content = content.replace(/(src|href)=(["'])\/(?!misbaha\/)(?!https?:\/\/)(assets\/|_expo\/|favicon\.ico)\2/gi,
    (match, attr, quote, pathPart) => {
      if (match.includes('/misbaha/')) {
        return match;
      }
      return `${attr}=${quote}/misbaha/${pathPart}${quote}`;
    }
  );
  
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
let htmlFixed = fixPathsInHtml(indexPath);
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

console.log('⚠️  Note: JS files are NOT processed to avoid breaking regex patterns');
console.log('📝 Paths in JS files should be handled by Expo build configuration');
console.log('🎉 All paths fixed for GitHub Pages!');
