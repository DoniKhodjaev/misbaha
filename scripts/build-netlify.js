const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const appJsonPath = path.join(rootDir, 'app.json');
const appNetlifyJsonPath = path.join(rootDir, 'app.netlify.json');
const appJsonBackupPath = path.join(rootDir, 'app.json.backup');

console.log('🚀 Building for Netlify...\n');

// Сохраняем оригинальный app.json
if (fs.existsSync(appJsonPath)) {
  fs.copyFileSync(appJsonPath, appJsonBackupPath);
  console.log('✅ Backed up app.json');
}

// Заменяем app.json на app.netlify.json
if (fs.existsSync(appNetlifyJsonPath)) {
  fs.copyFileSync(appNetlifyJsonPath, appJsonPath);
  console.log('✅ Using app.netlify.json configuration');
} else {
  console.error('❌ app.netlify.json not found!');
  process.exit(1);
}

try {
  // Собираем приложение
  console.log('\n📦 Building application...');
  execSync('npx expo export -p web', { stdio: 'inherit', cwd: rootDir });
  
  // Исправляем пути
  console.log('\n🔧 Fixing paths...');
  execSync('node scripts/fix-paths-netlify.js', { stdio: 'inherit', cwd: rootDir });
  
  // Восстанавливаем оригинальный app.json
  if (fs.existsSync(appJsonBackupPath)) {
    fs.copyFileSync(appJsonBackupPath, appJsonPath);
    fs.unlinkSync(appJsonBackupPath);
    console.log('\n✅ Restored original app.json');
  }
  
  console.log('\n🎉 Build for Netlify completed successfully!');
  console.log('📁 Output: dist/');
  console.log('\n💡 Next step: Drag the dist folder to Netlify');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  
  // Восстанавливаем оригинальный app.json в случае ошибки
  if (fs.existsSync(appJsonBackupPath)) {
    fs.copyFileSync(appJsonBackupPath, appJsonPath);
    fs.unlinkSync(appJsonBackupPath);
    console.log('✅ Restored original app.json');
  }
  
  process.exit(1);
}

