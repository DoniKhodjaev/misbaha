/**
 * Telegram Bot для Misbaha Mini App
 * 
 * Установка зависимостей:
 * npm install node-telegram-bot-api
 * 
 * Запуск:
 * node telegram-bot.js
 * 
 * Или с переменными окружения:
 * TELEGRAM_BOT_TOKEN=ваш_токен WEB_APP_URL=https://ваш-сайт.netlify.app node telegram-bot.js
 */

const TelegramBot = require('node-telegram-bot-api');

// Получаем токен из переменных окружения или используем значение по умолчанию
const token = process.env.TELEGRAM_BOT_TOKEN || '8519726866:AAFD94FpjP1ToMce_ejIK8Y2IscIKocqFj0';
const webAppUrl = process.env.WEB_APP_URL || 'https://donikhodjaev.github.io/misbaha';

// Хранилище данных пользователей (в продакшене используйте базу данных)
const userData = new Map();

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot для Misbaha запущен!');
console.log(`📱 Web App URL: ${webAppUrl}`);

// Команда /start - показывает кнопку для открытия Mini App
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Пользователь';
  
  bot.sendMessage(chatId, 
    `👋 Ассаламу алейкум, ${firstName}!\n\n` +
    `📿 Добро пожаловать в **Misbaha** - современный счетчик зикра.\n\n` +
    `✨ Используйте кнопку ниже, чтобы открыть приложение и начать совершать зикр.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📿 Открыть счетчик зикра',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    }
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 
    `📿 **Misbaha - Счетчик Зикра**\n\n` +
    `**Возможности:**\n` +
    `✅ Подсчет различных видов зикра\n` +
    `✅ Ежедневная статистика и цели\n` +
    `✅ История за последние 30 дней\n` +
    `✅ Достижения и награды\n` +
    `✅ Напоминания о зикре\n` +
    `✅ Работает офлайн\n\n` +
    `**Команды:**\n` +
    `/start - Открыть приложение\n` +
    `/help - Показать эту справку\n` +
    `/app - Открыть приложение\n` +
    `/stats - Показать статистику\n` +
    `/sync - Синхронизировать данные\n\n` +
    `Нажмите кнопку ниже, чтобы начать! 👇`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📿 Открыть приложение',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    }
  );
});

// Команда /app - альтернативный способ открыть приложение
bot.onText(/\/app/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '📿 Открываю приложение...', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📿 Открыть счетчик зикра',
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Обработка callback_query (нажатие на кнопки)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data === 'open_app') {
    bot.answerCallbackQuery(query.id, {
      text: 'Открываю приложение...',
      show_alert: false
    });
    
    bot.sendMessage(chatId, '📿 Нажмите на кнопку ниже, чтобы открыть приложение:', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📿 Открыть счетчик зикра',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    });
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Команда /stats - отправка статистики
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  const data = userData.get(userId);
  if (!data || !data.stats) {
    bot.sendMessage(chatId, 
      '📊 Статистика пока недоступна.\n\n' +
      'Откройте приложение и начните совершать зикр, чтобы увидеть статистику!',
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📿 Открыть приложение',
              web_app: { url: webAppUrl }
            }
          ]]
        }
      }
    );
    return;
  }
  
  const stats = data.stats;
  const today = stats.todayCount || 0;
  const total = stats.totalAllTime || 0;
  const streak = stats.streakDays || 0;
  const goal = stats.dailyGoal || 100;
  const progress = goal > 0 ? Math.round((today / goal) * 100) : 0;
  
  let message = `📊 **Ваша статистика**\n\n`;
  message += `📿 Сегодня: ${today} зикр\n`;
  message += `🎯 Цель: ${goal} зикр (${progress}%)\n`;
  message += `📈 Всего: ${total} зикр\n`;
  message += `🔥 Серия: ${streak} дней подряд\n\n`;
  
  if (stats.history && stats.history.length > 0) {
    const avg = Math.round(stats.history.reduce((sum, h) => sum + h.total, 0) / stats.history.length);
    const bestDay = Math.max(...stats.history.map(h => h.total));
    message += `📊 Среднее в день: ${avg} зикр\n`;
    message += `⭐ Лучший день: ${bestDay} зикр\n`;
  }
  
  if (stats.achievements && stats.achievements.length > 0) {
    message += `\n🏆 Достижений: ${stats.achievements.length}`;
  }
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📿 Открыть приложение',
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Команда /sync - синхронизация данных
bot.onText(/\/sync/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🔄 Для синхронизации данных откройте приложение.\n\n' +
    'Данные автоматически синхронизируются при использовании приложения.',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📿 Открыть приложение',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    }
  );
});

// Обработка данных из Mini App
bot.on('message', (msg) => {
  // Игнорируем команды, они обрабатываются отдельно
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  const userId = msg.from.id.toString();
  
  // Обработка данных из web_app (если отправляются через sendData)
  if (msg.web_app_data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      
      // Сохраняем данные пользователя
      userData.set(userId, {
        stats: data,
        lastSync: new Date().toISOString(),
        user: msg.from
      });
      
      console.log(`✅ Данные синхронизированы для пользователя ${userId}`);
      
      // Отправляем подтверждение пользователю
      bot.sendMessage(msg.chat.id, '✅ Данные успешно синхронизированы!', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📊 Показать статистику',
              callback_data: 'show_stats'
            },
            {
              text: '📿 Открыть приложение',
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('Ошибка обработки данных из Mini App:', error);
    }
  }
  
  // Обработка JSON данных, отправленных как текст (fallback)
  if (msg.text && msg.text.trim().startsWith('{')) {
    try {
      const data = JSON.parse(msg.text);
      if (data.type === 'stats' || data.todayCount !== undefined) {
        userData.set(userId, {
          stats: data,
          lastSync: new Date().toISOString(),
          user: msg.from
        });
        console.log(`✅ Данные синхронизированы для пользователя ${userId} (через текст)`);
      }
    } catch (error) {
      // Не JSON данные, игнорируем
    }
  }
});

// Обработка callback_query для кнопок
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userId = query.from.id.toString();
  
  if (data === 'stats' || data === 'show_stats') {
    const userStats = userData.get(userId);
    
    if (userStats && userStats.stats) {
      const stats = userStats.stats;
      const today = stats.todayCount || 0;
      const total = stats.totalAllTime || 0;
      
      bot.answerCallbackQuery(query.id, {
        text: `Сегодня: ${today} зикр | Всего: ${total} зикр`,
        show_alert: false
      });
    } else {
      bot.answerCallbackQuery(query.id, {
        text: 'Статистика пока недоступна. Откройте приложение и синхронизируйте данные.',
        show_alert: true
      });
    }
  }
});

console.log('✅ Бот готов к работе!');
console.log('📝 Отправьте /start боту, чтобы начать');

// Экспорт для использования в других модулях
module.exports = bot;

