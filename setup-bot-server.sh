#!/bin/bash

# Скрипт для автоматической настройки бота на сервере
# Использование: ./setup-bot-server.sh

set -e

echo "🚀 Настройка Misbaha Telegram Bot на сервере..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка Node.js
echo -e "${YELLOW}Проверка Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Установка...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js установлен: $(node --version)${NC}"
fi

# Создание директории
BOT_DIR="/root/misbaha"
echo -e "${YELLOW}Создание директории ${BOT_DIR}...${NC}"
mkdir -p $BOT_DIR
cd $BOT_DIR

# Проверка наличия файлов
if [ ! -f "telegram-bot.js" ]; then
    echo -e "${RED}Файл telegram-bot.js не найден!${NC}"
    echo "Пожалуйста, загрузите файлы на сервер вручную."
    exit 1
fi

# Установка зависимостей
echo -e "${YELLOW}Установка зависимостей...${NC}"
npm install node-telegram-bot-api

# Запрос переменных окружения
echo -e "${YELLOW}Настройка переменных окружения...${NC}"
read -p "Введите TELEGRAM_BOT_TOKEN (или нажмите Enter для использования значения по умолчанию): " BOT_TOKEN
read -p "Введите WEB_APP_URL (например: https://misbaha-app.netlify.app): " WEB_APP_URL

if [ -z "$BOT_TOKEN" ]; then
    BOT_TOKEN="8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0"
fi

# Создание .env файла
echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" > .env
echo "WEB_APP_URL=$WEB_APP_URL" >> .env
echo -e "${GREEN}Файл .env создан${NC}"

# Создание systemd сервиса
echo -e "${YELLOW}Создание systemd сервиса...${NC}"
cat > /etc/systemd/system/misbaha-bot.service << EOF
[Unit]
Description=Misbaha Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BOT_DIR
Environment="TELEGRAM_BOT_TOKEN=$BOT_TOKEN"
Environment="WEB_APP_URL=$WEB_APP_URL"
ExecStart=/usr/bin/node $BOT_DIR/telegram-bot.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузка systemd
systemctl daemon-reload

# Включение автозапуска
systemctl enable misbaha-bot

echo -e "${GREEN}Сервис создан и настроен!${NC}"
echo ""
echo -e "${YELLOW}Для запуска бота выполните:${NC}"
echo "  systemctl start misbaha-bot"
echo ""
echo -e "${YELLOW}Для проверки статуса:${NC}"
echo "  systemctl status misbaha-bot"
echo ""
echo -e "${YELLOW}Для просмотра логов:${NC}"
echo "  journalctl -u misbaha-bot -f"
echo ""
echo -e "${GREEN}✅ Настройка завершена!${NC}"

