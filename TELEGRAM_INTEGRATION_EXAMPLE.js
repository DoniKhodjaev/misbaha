/**
 * Пример интеграции Telegram Web App API в App.js
 * 
 * Этот код можно добавить в App.js для поддержки Telegram Mini App
 * 
 * Инструкция:
 * 1. Скопируйте код ниже в начало App.js (после импортов)
 * 2. Добавьте вызов initTelegramWebApp() в useEffect при загрузке
 * 3. Опционально: используйте функции для вибрации и других возможностей
 */

// Добавьте этот код в начало App.js после импортов:

// ============================================
// TELEGRAM WEB APP INTEGRATION
// ============================================

// Проверка, запущено ли в Telegram
const isTelegram = () => {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
};

// Инициализация Telegram Web App
const initTelegramWebApp = () => {
  if (!isTelegram()) return null;
  
  const tg = window.Telegram.WebApp;
  
  // Готовим приложение к показу
  tg.ready();
  
  // Разворачиваем на весь экран
  tg.expand();
  
  // Устанавливаем цвета темы (под цвет вашего приложения)
  tg.setHeaderColor('#004734');
  tg.setBackgroundColor('#004734');
  
  // Включаем закрытие по свайпу вниз
  tg.enableClosingConfirmation();
  
  // Получаем данные пользователя (опционально)
  const user = tg.initDataUnsafe?.user;
  if (user) {
    console.log('Telegram user:', user);
    // Можно использовать данные пользователя, например:
    // - user.first_name для приветствия
    // - user.language_code для автоматического выбора языка
  }
  
  // Получаем параметры темы Telegram (опционально)
  const theme = tg.themeParams;
  if (theme) {
    console.log('Telegram theme:', theme);
    // Можно использовать цвета темы Telegram для адаптации интерфейса
  }
  
  return tg;
};

// Улучшенная функция вибрации с поддержкой Telegram Haptic Feedback
const vibrateWithTelegram = (pattern, vibrationEnabled) => {
  if (!vibrationEnabled) return;
  
  // Если запущено в Telegram, используем Haptic Feedback
  if (isTelegram()) {
    const tg = window.Telegram.WebApp;
    if (tg.HapticFeedback) {
      if (typeof pattern === 'number') {
        // Простая вибрация
        tg.HapticFeedback.impactOccurred('light');
      } else if (Array.isArray(pattern)) {
        // Сложная вибрация
        tg.HapticFeedback.impactOccurred('medium');
      }
      return;
    }
  }
  
  // Fallback на обычную вибрацию
  if (Platform.OS === 'web') {
    try {
      if ('vibrate' in navigator) {
        if (typeof pattern === 'number') {
          navigator.vibrate(pattern);
        } else if (Array.isArray(pattern)) {
          navigator.vibrate(pattern);
        }
      }
    } catch (error) {
      console.log('Vibration not supported:', error);
    }
  } else {
    try {
      if (typeof pattern === 'number') {
        Vibration.vibrate(pattern);
      } else if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      }
    } catch (error) {
      console.log('Vibration error:', error);
    }
  }
};

// ============================================
// ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТЕ
// ============================================

// Добавьте в useEffect при загрузке приложения:
/*
  useEffect(() => {
    // Инициализация Telegram Web App (если запущено в Telegram)
    if (Platform.OS === 'web') {
      initTelegramWebApp();
    }
    
    // Остальной код инициализации...
  }, []);
*/

// Замените вызовы vibrate() на vibrateWithTelegram():
/*
  // Было:
  vibrate(50);
  
  // Стало:
  vibrateWithTelegram(50, vibrationEnabled);
*/

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ
// ============================================

// Закрытие Mini App программно:
/*
  const closeApp = () => {
    if (isTelegram()) {
      window.Telegram.WebApp.close();
    }
  };
*/

// Показ алерта через Telegram:
/*
  const showTelegramAlert = (message) => {
    if (isTelegram()) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      Alert.alert('', message);
    }
  };
*/

// Показ подтверждения через Telegram:
/*
  const showTelegramConfirm = (message, callback) => {
    if (isTelegram()) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      Alert.alert('Подтверждение', message, [
        { text: 'Отмена', onPress: () => callback(false) },
        { text: 'OK', onPress: () => callback(true) }
      ]);
    }
  };
*/

// Отправка данных обратно в бота:
/*
  const sendDataToBot = (data) => {
    if (isTelegram()) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
  };
*/

// Получение данных пользователя для персонализации:
/*
  const getTelegramUser = () => {
    if (isTelegram()) {
      return window.Telegram.WebApp.initDataUnsafe?.user;
    }
    return null;
  };
  
  // Использование:
  const user = getTelegramUser();
  if (user) {
    console.log(`Привет, ${user.first_name}!`);
    // Можно использовать user.language_code для автоматического выбора языка
  }
*/

// ============================================
// ПРИМЕР ПОЛНОЙ ИНТЕГРАЦИИ
// ============================================

/*
export default function App() {
  // ... существующие состояния ...
  
  const [telegramUser, setTelegramUser] = useState(null);
  
  useEffect(() => {
    // Инициализация Telegram Web App
    if (Platform.OS === 'web') {
      const tg = initTelegramWebApp();
      if (tg) {
        const user = tg.initDataUnsafe?.user;
        if (user) {
          setTelegramUser(user);
          // Автоматически выбираем язык на основе языка пользователя Telegram
          if (user.language_code) {
            const langMap = {
              'ru': 'ru',
              'en': 'en',
              'ar': 'ar',
              'uz': 'uz',
            };
            const detectedLang = langMap[user.language_code] || 'ru';
            setCurrentLanguage(detectedLang);
          }
        }
      }
    }
    
    // Остальная инициализация...
    initializeApp();
  }, []);
  
  // Используйте vibrateWithTelegram вместо vibrate
  const incrementCount = () => {
    // ... существующий код ...
    
    if (vibrationEnabled) {
      vibrateWithTelegram(50, vibrationEnabled);
      if (newCount % 33 === 0) {
        setTimeout(() => vibrateWithTelegram([100, 50, 100], vibrationEnabled), 100);
      }
    }
    
    // ... остальной код ...
  };
  
  // ... остальной код компонента ...
}
*/

