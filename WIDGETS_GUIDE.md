# Руководство по виджетам для Misbaha

## Что такое виджеты?

Виджеты - это элементы интерфейса, которые отображаются на главном экране устройства (iOS Home Screen Widgets и Android App Widgets). Они позволяют пользователям видеть информацию из приложения без его открытия.

## Возможности виджетов для Misbaha

### Что можно отображать в виджете:

1. **Текущий счетчик зикра за сегодня**
   - Большой счетчик с текущим количеством
   - Прогресс к цели на день
   - Процент выполнения цели

2. **Статистика**
   - Общее количество зикров за сегодня
   - Лучший день
   - Серия дней подряд

3. **Быстрый доступ**
   - Кнопка для быстрого открытия приложения
   - Отображение последнего использованного зикра

## Технические требования

### ⚠️ Важно знать:

**Виджеты требуют нативного кода и не могут быть реализованы только через Expo Go.**

Для реализации виджетов необходимо:

1. **Для iOS:**
   - Widget Extension (требует Xcode и нативный Swift код)
   - iOS 14+ для поддержки виджетов
   - App Groups для обмена данными между приложением и виджетом

2. **Для Android:**
   - App Widget Provider (требует нативный Kotlin/Java код)
   - Android 1.0+ (виджеты поддерживаются с первых версий)

## Варианты реализации

### Вариант 1: Нативные виджеты (Рекомендуется)

**Требования:**
- Expo Development Build (не Expo Go)
- Доступ к нативному коду
- Знания Swift (iOS) и Kotlin/Java (Android)

**Преимущества:**
- Полная функциональность
- Нативная производительность
- Поддержка всех возможностей платформы

**Недостатки:**
- Требует нативного кода
- Сложнее в поддержке
- Нужно обновлять при изменении платформ

### Вариант 2: Использование библиотек

Существуют библиотеки, которые упрощают создание виджетов:

**Для iOS:**
- `react-native-widget-extension` (требует настройки)
- Напрямую через WidgetKit API

**Для Android:**
- `react-native-android-widget` (требует настройки)
- Напрямую через App Widget API

### Вариант 3: Альтернативные решения

1. **Shortcuts (iOS) / Quick Actions (Android)**
   - Быстрые действия из меню приложения
   - Меньше функциональности, но проще в реализации

2. **Live Activities (iOS 16+)**
   - Динамические обновления на экране блокировки
   - Требует iOS 16+

## Рекомендации

Для вашего приложения **Misbaha** я рекомендую:

1. **Начать с простого виджета:**
   - Отображение текущего счетчика за сегодня
   - Прогресс к цели
   - Кнопка для открытия приложения

2. **Использовать App Groups (iOS) / SharedPreferences (Android):**
   - Для обмена данными между приложением и виджетом
   - AsyncStorage уже используется в приложении

3. **Обновление виджета:**
   - При открытии приложения
   - Через Background Tasks (iOS) / WorkManager (Android)
   - При достижении цели

## Следующие шаги

Если вы хотите реализовать виджеты:

1. **Подготовка проекта:**
   ```bash
   npx expo prebuild
   ```

2. **Создание виджетов:**
   - iOS: Создать Widget Extension в Xcode
   - Android: Создать App Widget Provider

3. **Интеграция с данными:**
   - Использовать App Groups (iOS) для обмена данными
   - Использовать SharedPreferences (Android) для обмена данными

4. **Тестирование:**
   - Тестировать на реальных устройствах
   - Проверить обновление данных

## Пример структуры виджета

### iOS Widget (Swift):
```swift
import WidgetKit
import SwiftUI

struct MisbahaWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "MisbahaWidget",
            provider: MisbahaProvider()
        ) { entry in
            MisbahaWidgetView(entry: entry)
        }
        .configurationDisplayName("Misbaha")
        .description("Отслеживайте ваш прогресс зикра")
    }
}
```

### Android Widget (Kotlin):
```kotlin
class MisbahaWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Обновление виджета
    }
}
```

## Полезные ресурсы

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Android App Widgets Guide](https://developer.android.com/develop/ui/views/appwidgets)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

---

**Примечание:** Реализация виджетов требует дополнительной работы и нативного кода. Если вы хотите, я могу помочь с подготовкой структуры проекта и начальной настройкой виджетов.

