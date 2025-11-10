#!/bin/bash
# Команды для быстрого копирования на сервер
# Используйте эти команды по порядку

# ============================================
# 1. ПОДКЛЮЧЕНИЕ К СЕРВЕРУ
# ============================================
# ssh root@83.147.247.11

# ============================================
# 2. УСТАНОВКА NODE.JS (если не установлен)
# ============================================
# curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# apt-get install -y nodejs
# node --version

# ============================================
# 3. СОЗДАНИЕ ДИРЕКТОРИИ
# ============================================
# mkdir -p /root/misbaha
# cd /root/misbaha

# ============================================
# 4. СОЗДАНИЕ ФАЙЛА telegram-bot.js
# ============================================
# nano telegram-bot.js
# (Вставьте содержимое файла, сохраните: Ctrl+O, Enter, Ctrl+X)

# ============================================
# 5. УСТАНОВКА ЗАВИСИМОСТЕЙ
# ============================================
# npm install node-telegram-bot-api

# ============================================
# 6. СОЗДАНИЕ SYSTEMD СЕРВИСА
# ============================================
# nano /etc/systemd/system/misbaha-bot.service
# (Вставьте содержимое ниже, замените WEB_APP_URL на ваш!)

# [Unit]
# Description=Misbaha Telegram Bot
# After=network.target
# 
# [Service]
# Type=simple
# User=root
# WorkingDirectory=/root/misbaha
# Environment="TELEGRAM_BOT_TOKEN=8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0"
# Environment="WEB_APP_URL=https://donikhodjaev.github.io/misbaha/"
# ExecStart=/usr/bin/node /root/misbaha/telegram-bot.js
# Restart=always
# RestartSec=10
# 
# [Install]
# WantedBy=multi-user.target

# ============================================
# 7. ЗАПУСК БОТА
# ============================================
# systemctl daemon-reload
# systemctl enable misbaha-bot
# systemctl start misbaha-bot

# ============================================
# 8. ПРОВЕРКА
# ============================================
# systemctl status misbaha-bot
# journalctl -u misbaha-bot -f

# ============================================
# ПОЛЕЗНЫЕ КОМАНДЫ
# ============================================
# # Остановить бота
# systemctl stop misbaha-bot
# 
# # Запустить бота
# systemctl start misbaha-bot
# 
# # Перезапустить бота
# systemctl restart misbaha-bot
# 
# # Посмотреть логи (последние 50 строк)
# journalctl -u misbaha-bot -n 50
# 
# # Посмотреть логи в реальном времени
# journalctl -u misbaha-bot -f
# 
# # Проверить, что процесс запущен
# ps aux | grep telegram-bot

