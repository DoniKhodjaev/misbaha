# ⚡ Быстрый деплой - Краткая инструкция

## ✅ Используем GitHub Pages

**Web App URL**: `https://donikhodjaev.github.io/misbaha/`

Эта ссылка уже работает! Просто используйте её для настройки Telegram Mini App.

---

## 🤖 2. Telegram Mini App (2 минуты)

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/newapp` → выберите бота
3. **Web App URL**: `https://donikhodjaev.github.io/misbaha/`
4. **Short name**: `misbaha`
5. **Title**: `Misbaha - Счетчик Зикра`
6. **Description**: `Современное приложение для подсчета зикра`
7. **Photo**: Загрузите `assets/ico.png`
8. Готово!

---

## 🖥️ 3. Запуск бота на сервере (10 минут)

### Подключитесь к серверу:
```bash
ssh root@83.147.247.11
```

### На сервере выполните:

```bash
# 1. Создайте директорию
mkdir -p /root/misbaha
cd /root/misbaha

# 2. Создайте файл telegram-bot.js (скопируйте с вашего компьютера)
# Или используйте nano:
nano telegram-bot.js
# Вставьте содержимое файла, сохраните (Ctrl+O, Enter, Ctrl+X)

# 3. Установите Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Установите зависимости
npm install node-telegram-bot-api

# 5. Создайте systemd сервис
nano /etc/systemd/system/misbaha-bot.service
```

Вставьте в файл:
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

```bash
# 6. Запустите бота
systemctl daemon-reload
systemctl enable misbaha-bot
systemctl start misbaha-bot

# 7. Проверьте статус
systemctl status misbaha-bot

# 8. Посмотрите логи
journalctl -u misbaha-bot -f
```

---

## ✅ Готово!

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите "📿 Открыть счетчик зикра"
4. Наслаждайтесь! 🎉

---

## 📚 Подробные инструкции:

- **Netlify**: [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
- **Бот на сервере**: [DEPLOY_BOT_SSH.md](./DEPLOY_BOT_SSH.md)
- **Полная инструкция**: [DEPLOY_COMPLETE_GUIDE.md](./DEPLOY_COMPLETE_GUIDE.md)

