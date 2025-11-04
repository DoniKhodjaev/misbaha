# Инструкция по сборке приложения Misbaha

## Вариант 1: EAS Build (Рекомендуется - облачная сборка)

EAS Build - это сервис Expo для создания standalone приложений без необходимости настройки локального окружения.

### Шаги:

1. **Установите EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Войдите в аккаунт Expo:**
```bash
eas login
```
Если у вас нет аккаунта, создайте его на https://expo.dev

3. **Инициализируйте проект:**
```bash
eas build:configure
```
Это создаст или обновит файл `eas.json`

4. **Соберите приложение:**

   **Для Android (APK файл):**
   ```bash
   eas build --platform android --profile preview
   ```
   Или для production:
   ```bash
   eas build --platform android --profile production
   ```

   **Для iOS:**
   ```bash
   eas build --platform ios --profile preview
   ```

5. **Следуйте инструкциям:**
   - EAS Build создаст приложение в облаке
   - После завершения сборки вы получите ссылку для скачивания
   - Для Android: скачайте APK файл и установите на телефон
   - Для iOS: вам понадобится Apple Developer аккаунт (99$/год)

6. **Установка на телефон:**
   - **Android**: Скачайте APK файл на телефон и откройте его для установки
   - **iOS**: Используйте TestFlight или прямую установку через EAS

---

## Вариант 2: Локальная сборка (Более сложный)

### Для Android:

**Требования:**
- Android Studio
- Java Development Kit (JDK)
- Android SDK

**Шаги:**

1. Установите необходимые инструменты:
```bash
npx expo install expo-dev-client
```

2. Запустите сборку:
```bash
npx expo run:android
```

Это создаст APK файл локально.

### Для iOS:

**Требования:**
- macOS
- Xcode
- CocoaPods
- Apple Developer аккаунт (для установки на устройство)

**Шаги:**

1. Установите зависимости:
```bash
cd ios
pod install
cd ..
```

2. Откройте проект в Xcode:
```bash
npx expo run:ios
```

Или откройте `ios/misbaha.xcworkspace` в Xcode и соберите там.

---

## Быстрый старт (EAS Build):

```bash
# 1. Установка EAS CLI
npm install -g eas-cli

# 2. Вход в аккаунт
eas login

# 3. Настройка проекта
eas build:configure

# 4. Сборка Android APK
eas build --platform android --profile preview

# 5. После завершения - скачайте APK и установите на телефон
```

---

## Примечания:

- **Первый build**: может занять 10-20 минут
- **Последующие builds**: быстрее благодаря кэшированию
- **Android APK**: можно установить напрямую на телефон
- **iOS**: требует Apple Developer аккаунт для установки на реальное устройство
- **EAS Build**: бесплатный план включает ограниченное количество сборок в месяц

---

## Полезные команды:

- `eas build:list` - список всех сборок
- `eas build:view` - просмотр статуса сборки
- `eas build:submit` - отправка в App Store / Google Play

