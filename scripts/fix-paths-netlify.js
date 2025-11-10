const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}

console.log('🔍 Fixing paths for Netlify (root paths)...');

// Функция для замены путей в файле (убираем /misbaha/ префикс)
function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Убираем префикс /misbaha/ из всех путей
  content = content.replace(/\/misbaha\//g, '/');
  
  // Исправляем двойные слеши
  content = content.replace(/\/\//g, '/');
  
  // Исправляем пути, которые начинаются с /misbaha (без слеша после)
  content = content.replace(/\/misbaha([^\/])/g, '/$1');
  
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

// Копируем favicon в корень dist
const faviconDestPath = path.join(distPath, 'favicon.ico');
if (fs.existsSync(iconSourcePath)) {
  fs.copyFileSync(iconSourcePath, faviconDestPath);
  console.log('✅ Copied favicon.ico to dist root');
}

// Копируем manifest для Netlify
const manifestNetlifyPath = path.join(__dirname, '..', 'web', 'manifest.netlify.json');
const manifestDestPath = path.join(distPath, 'manifest.json');
if (fs.existsSync(manifestNetlifyPath)) {
  fs.copyFileSync(manifestNetlifyPath, manifestDestPath);
  console.log('✅ Copied manifest.json for Netlify');
}

// Добавляем мета-теги для iOS PWA (с корневыми путями)
console.log('🍎 Adding iOS PWA meta tags...');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Удаляем старые мета-теги для iOS если они есть
htmlContent = htmlContent.replace(/<meta name="apple-mobile-web-app-[^"]*"[^>]*>/g, '');
htmlContent = htmlContent.replace(/<link rel="apple-touch-icon[^"]*"[^>]*>/g, '');
htmlContent = htmlContent.replace(/<meta name="viewport"[^>]*>/g, '');

// Добавляем правильные мета-теги перед </head> (с корневыми путями)
const iosMetaTags = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Misbaha">
    <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/assets/assets/ico.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/assets/ico.png">
    <link rel="apple-touch-icon" sizes="512x512" href="/assets/assets/ico.png">`;

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
console.log('🎉 All paths fixed for Netlify!');

