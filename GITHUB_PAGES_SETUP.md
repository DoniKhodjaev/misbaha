# Инструкция по загрузке на GitHub и настройке GitHub Pages

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните:
   - **Repository name**: `misbaha` (или любое другое имя)
   - **Description**: "Счетчик Зикра - PWA приложение"
   - Выберите **Private** (или Public, если хотите открытый код)
   - **НЕ** создавайте README, .gitignore или лицензию (они уже есть)
4. Нажмите **"Create repository"**

## Шаг 2: Загрузите код на GitHub

После создания репозитория GitHub покажет инструкции. Выполните команды (замените `YOUR_USERNAME` на ваш GitHub username):

```bash
git remote add origin https://github.com/DoniKhodjaev/misbaha.git
git branch -M main
git push -u origin main
```

Если у вас еще не настроен git на компьютере, сначала настройте:

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваш@email.com"
```

## Шаг 3: Соберите PWA версию

```bash
npm run build:web
```

Это создаст папку `dist` с готовым PWA приложением.

## Шаг 4: Настройте GitHub Pages

### Вариант 1: Через GitHub Actions (Рекомендуется)

1. Создайте файл `.github/workflows/deploy.yml` в проекте:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build:web
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Добавьте и закоммитьте файл:

```bash
mkdir -p .github/workflows
# Создайте файл .github/workflows/deploy.yml с содержимым выше
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions for GitHub Pages"
git push
```

3. В настройках репозитория на GitHub:
   - Settings → Pages
   - Source: **GitHub Actions**

### Вариант 2: Через ветку gh-pages (Проще)

1. Соберите проект:
```bash
npm run build:web
```

2. Создайте ветку gh-pages и загрузите dist:
```bash
git checkout --orphan gh-pages
git reset
git add dist/
git commit -m "Deploy PWA to GitHub Pages"
git push origin gh-pages
```

3. В настройках репозитория на GitHub:
   - Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** → **/ (root)**
   - Save

### Вариант 3: Через папку dist в main ветке

1. Соберите проект:
```bash
npm run build:web
```

2. Добавьте dist в git (временно для Pages):
```bash
git add dist/
git commit -m "Add dist for GitHub Pages"
git push
```

3. В настройках репозитория на GitHub:
   - Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **main** → **/dist**
   - Save

**⚠️ Примечание:** Для этого варианта нужно убрать `dist/` из `.gitignore`

## Шаг 5: Проверьте работу

После настройки GitHub Pages:
1. Подождите 1-2 минуты для сборки
2. Откройте: `https://YOUR_USERNAME.github.io/misbaha`
3. Если используется вариант 3: `https://YOUR_USERNAME.github.io/misbaha/dist`

## Шаг 6: Установка на iPhone

1. Откройте сайт в **Safari** на iPhone
2. Нажмите кнопку **"Поделиться"** (квадрат со стрелкой вверх)
3. Выберите **"На экран «Домой»"**
4. Приложение установится на главный экран!

## 🔄 Обновление приложения

После изменений:

1. Внесите изменения в код
2. Закоммитьте и загрузите:
```bash
git add .
git commit -m "Описание изменений"
git push
```

3. Если используется GitHub Actions - сборка произойдет автоматически
4. Если используете gh-pages - пересоберите и загрузите:
```bash
npm run build:web
git checkout gh-pages
# ... обновите dist
git push
```

## ✅ Готово!

Теперь ваше PWA приложение доступно в интернете и может быть установлено на iPhone без Apple Developer аккаунта!

