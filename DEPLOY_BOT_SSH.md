# 🤖 Запуск бота на сервере через SSH

## 📋 Информация о сервере

- **IPv4**: `83.147.247.11`
- **IPv6**: `2a03:6f01:1:2::1:8979`
- **SSH**: `ssh root@83.147.247.11`
- **Root пароль**: (у вас есть)

## 🚀 Шаг 1: Подключение к серверу

### Через SSH:
```bash
ssh root@83.147.247.11
```

Введите root пароль при запросе.

## 📦 Шаг 2: Установка Node.js

Проверьте, установлен ли Node.js:
```bash
node --version
npm --version
```

Если не установлен, установите Node.js 18+:

### Для Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### Для CentOS/RHEL:
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
```

## 📥 Шаг 3: Загрузка файлов на сервер

### Вариант 1: Через SCP (с вашего компьютера)
```bash
# Создайте архив проекта (исключая node_modules)
tar -czf misbaha-bot.tar.gz --exclude='node_modules' --exclude='dist' telegram-bot.js package.json

# Загрузите на сервер
scp misbaha-bot.tar.gz root@83.147.247.11:/root/
```

### Вариант 2: Через Git (если репозиторий публичный)
```bash
# На сервере
cd /root
git clone https://github.com/ваш-username/ваш-репозиторий.git misbaha
cd misbaha
```

### Вариант 3: Через wget/curl (если файлы на GitHub)
```bash
# На сервере
cd /root
mkdir misbaha
cd misbaha
wget https://raw.githubusercontent.com/ваш-username/ваш-репозиторий/main/telegram-bot.js
wget https://raw.githubusercontent.com/ваш-username/ваш-репозиторий/main/package.json
```

### Вариант 4: Создать файлы вручную на сервере
```bash
# На сервере
cd /root
mkdir misbaha
cd misbaha
nano telegram-bot.js
# Вставьте содержимое файла, сохраните (Ctrl+O, Enter, Ctrl+X)
nano package.json
# Вставьте содержимое package.json, сохраните
```

## 🔧 Шаг 4: Установка зависимостей

```bash
cd /root/misbaha
npm install node-telegram-bot-api
```

## ⚙️ Шаг 5: Настройка переменных окружения

Создайте файл `.env` или установите переменные:
```bash
nano .env
```

Добавьте:
```
TELEGRAM_BOT_TOKEN=8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0
WEB_APP_URL=https://donikhodjaev.github.io/misbaha/
```

Или экспортируйте переменные:
```bash
export TELEGRAM_BOT_TOKEN="8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0"
export WEB_APP_URL="https://donikhodjaev.github.io/misbaha/"
```

## 🚀 Шаг 6: Запуск бота

### Простой запуск (для теста):
```bash
node telegram-bot.js
```

### Запуск в фоне:
```bash
nohup node telegram-bot.js > bot.log 2>&1 &
```

### Проверка работы:
```bash
# Посмотреть логи
tail -f bot.log

# Проверить процесс
ps aux | grep node
```

## 🔄 Шаг 7: Настройка автозапуска (systemd)

Создайте сервис для автоматического запуска:

```bash
nano /etc/systemd/system/misbaha-bot.service
```

Добавьте:
```ini
[Unit]
Description=Misbaha Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/misbaha
Environment="TELEGRAM_BOT_TOKEN=8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0"
Environment="WEB_APP_URL=https://donikhodjaev.github.io/misbaha/"
ExecStart=/usr/bin/node /root/misbaha/telegram-bot.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Активируйте сервис:
```bash
# Перезагрузить systemd
systemctl daemon-reload

# Включить автозапуск
systemctl enable misbaha-bot

# Запустить сервис
systemctl start misbaha-bot

# Проверить статус
systemctl status misbaha-bot

# Посмотреть логи
journalctl -u misbaha-bot -f
```

## 📊 Управление ботом

### Остановить:
```bash
systemctl stop misbaha-bot
```

### Запустить:
```bash
systemctl start misbaha-bot
```

### Перезапустить:
```bash
systemctl restart misbaha-bot
```

### Посмотреть статус:
```bash
systemctl status misbaha-bot
```

### Посмотреть логи:
```bash
journalctl -u misbaha-bot -n 50
```

## 🔒 Безопасность

### 1. Настройте файрвол (если нужно):
```bash
# Установите ufw (если не установлен)
apt-get install ufw

# Разрешите SSH
ufw allow 22/tcp

# Включите файрвол
ufw enable
```

### 2. Создайте отдельного пользователя (рекомендуется):
```bash
# Создать пользователя
adduser misbaha

# Передать права на папку
chown -R misbaha:misbaha /root/misbaha

# В systemd сервисе измените User=misbaha
```

## 🐛 Отладка

### Проверка подключения:
```bash
# Проверить, что бот запущен
ps aux | grep telegram-bot

# Проверить логи
tail -f /root/misbaha/bot.log
# или
journalctl -u misbaha-bot -f
```

### Проверка переменных окружения:
```bash
# В systemd сервисе
systemctl show misbaha-bot | grep Environment
```

## 📝 Обновление бота

1. Загрузите новые файлы на сервер
2. Перезапустите сервис:
```bash
systemctl restart misbaha-bot
```

## ✅ Готово!

Бот теперь работает на сервере и автоматически запускается при перезагрузке!

## 🔗 Следующие шаги

1. Убедитесь, что бот отвечает на команды в Telegram
2. Проверьте работу Mini App
3. Настройте мониторинг (опционально)

