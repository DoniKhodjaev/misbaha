/**
 * Утилиты для работы с Telegram Web App API
 * Используется в Mini App для интеграции с Telegram
 */

/**
 * Проверяет, запущено ли приложение в Telegram
 */
export const isTelegram = () => {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
};

/**
 * Получает экземпляр Telegram WebApp API
 */
export const getTelegramWebApp = () => {
  if (!isTelegram()) return null;
  return window.Telegram.WebApp;
};

/**
 * Инициализирует Telegram Web App
 */
export const initTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  if (!tg) return null;

  // Готовим приложение к показу
  tg.ready();
  
  // Разворачиваем на весь экран
  tg.expand();
  
  // Устанавливаем цвета темы
  tg.setHeaderColor('#004734');
  tg.setBackgroundColor('#004734');
  
  // Включаем закрытие по свайпу вниз
  tg.enableClosingConfirmation();
  
  return tg;
};

/**
 * Получает данные пользователя Telegram
 */
export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  
  return tg.initDataUnsafe?.user || null;
};

/**
 * Получает параметры темы Telegram
 */
export const getTelegramTheme = () => {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  
  return tg.themeParams || null;
};

/**
 * Определяет, нужно ли использовать темную тему
 */
export const isTelegramDarkTheme = () => {
  const theme = getTelegramTheme();
  if (!theme) return false;
  
  // Проверяем цвет фона - если он темный, значит темная тема
  const bgColor = theme.bg_color;
  if (!bgColor) return false;
  
  // Конвертируем hex в RGB и проверяем яркость
  const rgb = hexToRgb(bgColor);
  if (!rgb) return false;
  
  // Вычисляем яркость (luminance)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
};

/**
 * Конвертирует hex цвет в RGB
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Закрывает Mini App
 */
export const closeTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
};

/**
 * Показывает алерт в Telegram
 */
export const showTelegramAlert = (message) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showAlert(message);
  } else {
    // Fallback для обычного браузера
    alert(message);
  }
};

/**
 * Показывает подтверждение в Telegram
 */
export const showTelegramConfirm = (message, callback) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    // Fallback для обычного браузера
    const result = confirm(message);
    if (callback) callback(result);
  }
};

/**
 * Вибрация (Haptic Feedback) в Telegram
 */
export const vibrateTelegram = (type = 'light') => {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;
  
  const haptic = tg.HapticFeedback;
  
  switch (type) {
    case 'light':
      haptic.impactOccurred('light');
      break;
    case 'medium':
      haptic.impactOccurred('medium');
      break;
    case 'heavy':
      haptic.impactOccurred('heavy');
      break;
    case 'success':
      haptic.notificationOccurred('success');
      break;
    case 'error':
      haptic.notificationOccurred('error');
      break;
    case 'warning':
      haptic.notificationOccurred('warning');
      break;
    default:
      haptic.impactOccurred('light');
  }
};

/**
 * Отправляет данные обратно в бота (если нужно)
 */
export const sendDataToBot = (data) => {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  // Используем метод sendData для отправки данных
  if (tg.sendData) {
    tg.sendData(JSON.stringify(data));
  }
};

/**
 * Получает информацию о платформе
 */
export const getTelegramPlatform = () => {
  const tg = getTelegramWebApp();
  if (!tg) return 'unknown';
  
  return tg.platform || 'unknown';
};

/**
 * Проверяет, является ли платформа мобильной
 */
export const isTelegramMobile = () => {
  const platform = getTelegramPlatform();
  return platform === 'ios' || platform === 'android';
};

/**
 * Получает версию Telegram
 */
export const getTelegramVersion = () => {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  
  return tg.version || null;
};

