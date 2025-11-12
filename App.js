import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Vibration,
  Animated,
  ScrollView,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isIPhone16Pro = SCREEN_HEIGHT >= 932 && SCREEN_WIDTH >= 430;

// Цвета из дизайна
const COLORS = {
  darkTeal: '#0C7460',
  orange: '#FAA51B',
  veryDarkGreen: '#004734',
  lightText: '#E8E8E8',
  darkText: '#888888',
};

// Базовые виды зикра
const DEFAULT_ZIKR_TYPES = [
  { id: 'subhanallah', name: 'СубханАллах', arabic: 'سُبْحَانَ اللَّهِ' },
  { id: 'alhamdulillah', name: 'Альхамдулиллах', arabic: 'الْحَمْدُ لِلَّهِ' },
  { id: 'allahuakbar', name: 'Аллаху Акбар', arabic: 'اللَّهُ أَكْبَرُ' },
  { id: 'astaghfirullah', name: 'Астагфируллах', arabic: 'أَسْتَغْفِرُ اللَّه' },
  { id: 'laillahaillallah', name: 'Ля иляха илля Ллах', arabic: 'لَا إِلَٰهَ إِلَّا اللَّٰهُ' },
];

// Словарь для автозаполнения арабского текста
const ZIKR_ARABIC_MAP = {
  'субхан': 'سُبْحَانَ اللَّهِ',
  'субханаллах': 'سُبْحَانَ اللَّهِ',
  'альхамду': 'الْحَمْدُ لِلَّهِ',
  'альхамдулиллах': 'الْحَمْدُ لِلَّهِ',
  'аллах': 'اللَّهُ',
  'аллаху': 'اللَّهُ',
  'акбар': 'أَكْبَرُ',
  'аллаху акбар': 'اللَّهُ أَكْبَرُ',
  'астагфиру': 'أَسْتَغْفِرُ اللَّه',
  'астагфируллах': 'أَسْتَغْفِرُ اللَّه',
  'ля иляха': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
  'ля иляха илля': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
  'ля иляха илля ллах': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
  'ла илаха': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
  'ла илаха илла': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
  'ла илаха илла ллах': 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
};

// Достижения
const ACHIEVEMENTS = [
  { id: 'first_100', name: 'Первая сотня', description: 'Совершите 100 зикров', threshold: 100, icon: '🏆' },
  { id: 'first_1000', name: 'Тысяча', description: 'Совершите 1000 зикров', threshold: 1000, icon: '⭐' },
  { id: 'first_10000', name: 'Десять тысяч', description: 'Совершите 10000 зикров', threshold: 10000, icon: '👑' },
  { id: 'week_streak', name: 'Неделя подряд', description: '7 дней подряд', threshold: 7, icon: '🔥' },
  { id: 'month_streak', name: 'Месяц подряд', description: '30 дней подряд', threshold: 30, icon: '💎' },
  { id: 'goal_achiever', name: 'Достигатель целей', description: 'Достигните цели 10 раз', threshold: 10, icon: '🎯' },
];

// Темы оформления
const THEMES = {
  default: {
    name: 'По умолчанию',
    darkTeal: '#0C7460',
    orange: '#FAA51B',
    veryDarkGreen: '#004734',
    lightText: '#E8E8E8',
    darkText: '#888888',
  },
  ocean: {
    name: 'Океан',
    darkTeal: '#0D7377',
    orange: '#FFB84D',
    veryDarkGreen: '#003D52',
    lightText: '#E0F2F1',
    darkText: '#7FB3B3',
  },
  sunset: {
    name: 'Закат',
    darkTeal: '#B8860B',
    orange: '#FF6B35',
    veryDarkGreen: '#2C1810',
    lightText: '#FFF8E1',
    darkText: '#A68B5B',
  },
  forest: {
    name: 'Лес',
    darkTeal: '#2D5016',
    orange: '#FFA726',
    veryDarkGreen: '#1B3D0F',
    lightText: '#E8F5E9',
    darkText: '#81C784',
  },
};

// Языки
const LANGUAGES = {
  ru: {
    name: 'Русский',
    counter: 'Счетчик Зикра',
    today: 'Сегодня',
    yesterday: 'Вчера',
    history: 'История',
    stats: 'Статистика',
    settings: 'Настройки',
    currentSession: 'Текущая сессия',
    selectZikr: 'Нажмите для выбора',
    selectZikrTitle: 'Выберите зикр',
    addZikr: 'Добавить зикр',
    addNewZikr: '+ Добавить новый зикр',
    resetSession: 'Сбросить сессию',
    resetAll: 'Сбросить все данные',
    achievements: 'Достижения',
    viewAchievements: 'Просмотреть достижения',
    export: 'Экспорт данных',
    import: 'Импорт данных',
    theme: 'Тема оформления',
    language: 'Язык',
    sounds: 'Звуки',
    notifications: 'Уведомления',
    vibration: 'Вибрация',
    vibrationDesc: 'Вибрация при каждом зикре',
    reminders: 'Напоминания',
    remindersDesc: 'Уведомления о зикре',
    dailyReminderTime: 'Время ежедневного напоминания',
    dailyReminderTimeDesc: 'Время для ежедневного уведомления',
    reminderInterval: 'Интервал напоминаний',
    reminderIntervalDesc: 'Каждые N часов (0 = отключено)',
    goals: 'Цели',
    dailyGoal: 'Цель на день',
    dailyGoalDesc: 'Количество зикр для достижения цели',
    soundsDesc: 'Звуковые эффекты при зикре',
    data: 'Данные',
    sessionTimer: 'Таймер сессии',
    speed: 'Скорость',
    perMinute: 'в минуту',
    totalAllTime: 'Всего за все время',
    byTimeOfDay: 'По времени суток',
    byType: 'По типам зикра',
    charts: 'Графики',
    week: 'Неделя',
    month: 'Месяц',
    calendar: 'Календарь',
    zikrName: 'Название зикра *',
    zikrNameHint: 'Введите название на латинице',
    arabicText: 'Арабский текст',
    arabicTextHint: 'Опционально. Введите арабский текст',
    cancel: 'Отмена',
    add: 'Добавить',
    save: 'Сохранить',
    delete: 'Удалить',
    reset: 'Сбросить',
    historyEmpty: 'История пуста',
    historyEmptyDesc: 'Начните совершать зикр, чтобы увидеть статистику',
    zikr: 'зикр',
    averagePerDay: 'Среднее в день',
    bestDay: 'Лучший день',
    totalDays: 'Всего дней',
    daysStreak: 'Дней подряд',
    notEnoughData: 'Недостаточно данных',
    needMinHistory: 'Нужна минимум 1 запись в истории',
    notificationTimeTitle: 'Время уведомления',
    notificationTimeDesc: 'Выберите время для ежедневного напоминания (формат: HH:MM)',
    reminderIntervalTitle: 'Интервал напоминаний',
    reminderIntervalDesc: 'Выберите интервал между напоминаниями (в часах). 0 = отключено',
    disabled: 'Отключено',
    hours: 'ч',
    resetSessionTitle: 'Сброс сессии',
    resetSessionConfirm: 'Вы уверены, что хотите сбросить текущую сессию?',
    resetAllTitle: 'Сброс всех данных',
    resetAllConfirm: 'Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.',
    confirmation: 'Подтверждение',
    resetAllConfirm2: 'Это удалит ВСЕ данные. Вы абсолютно уверены?',
    importTitle: 'Импорт данных',
    importDesc: 'Вставьте JSON данные для импорта',
    importPlaceholder: 'Вставьте JSON данные...',
    importError: 'Введите данные для импорта',
    exportSuccess: 'Данные экспортированы',
    exportError: 'Не удалось экспортировать данные',
    importSuccess: 'Данные импортированы',
    importErrorFormat: 'Неверный формат данных',
    deleteZikr: 'Удалить зикр',
    deleteZikrConfirm: 'Вы уверены, что хотите удалить этот вид зикра?',
    enterZikrName: 'Введите название зикра',
    timeFormatError: 'Введите время в формате HH:MM (например, 09:00)',
    goalError: 'Введите число от 1 до 10000',
    permission: 'Разрешение',
    notificationPermission: 'Для уведомлений необходимо разрешение. Пожалуйста, включите уведомления в настройках устройства.',
    notificationPermissionApp: 'Для уведомлений необходимо разрешение. Пожалуйста, включите уведомления в настройках приложения.',
    goalAchieved: '🎉 Поздравляем!',
    goalAchievedText: 'Вы достигли цели на сегодня: {goal} зикр!',
    allDataReset: 'Все данные успешно сброшены',
    resetError: 'Ошибка при сбросе данных',
    error: 'Ошибка',
    success: 'Успех',
  },
  en: {
    name: 'English',
    counter: 'Zikr Counter',
    today: 'Today',
    yesterday: 'Yesterday',
    history: 'History',
    stats: 'Statistics',
    settings: 'Settings',
    currentSession: 'Current Session',
    selectZikr: 'Tap to select',
    selectZikrTitle: 'Select Zikr',
    addZikr: 'Add Zikr',
    addNewZikr: '+ Add New Zikr',
    resetSession: 'Reset Session',
    resetAll: 'Reset All Data',
    achievements: 'Achievements',
    viewAchievements: 'View Achievements',
    export: 'Export Data',
    import: 'Import Data',
    theme: 'Theme',
    language: 'Language',
    sounds: 'Sounds',
    notifications: 'Notifications',
    vibration: 'Vibration',
    vibrationDesc: 'Vibration on each zikr',
    reminders: 'Reminders',
    remindersDesc: 'Zikr notifications',
    dailyReminderTime: 'Daily Reminder Time',
    dailyReminderTimeDesc: 'Time for daily notification',
    reminderInterval: 'Reminder Interval',
    reminderIntervalDesc: 'Every N hours (0 = disabled)',
    goals: 'Goals',
    dailyGoal: 'Daily Goal',
    dailyGoalDesc: 'Number of zikr to achieve goal',
    soundsDesc: 'Sound effects on zikr',
    data: 'Data',
    sessionTimer: 'Session Timer',
    speed: 'Speed',
    perMinute: 'per minute',
    totalAllTime: 'Total All Time',
    byTimeOfDay: 'By Time of Day',
    byType: 'By Type',
    charts: 'Charts',
    week: 'Week',
    month: 'Month',
    calendar: 'Calendar',
    zikrName: 'Zikr Name *',
    zikrNameHint: 'Enter name in Latin',
    arabicText: 'Arabic Text',
    arabicTextHint: 'Optional. Enter Arabic text',
    cancel: 'Cancel',
    add: 'Add',
    save: 'Save',
    delete: 'Delete',
    reset: 'Reset',
    historyEmpty: 'History is empty',
    historyEmptyDesc: 'Start performing zikr to see statistics',
    zikr: 'zikr',
    averagePerDay: 'Average per Day',
    bestDay: 'Best Day',
    totalDays: 'Total Days',
    daysStreak: 'Days Streak',
    notEnoughData: 'Not enough data',
    needMinHistory: 'Need at least 1 entry in history',
    notificationTimeTitle: 'Notification Time',
    notificationTimeDesc: 'Select time for daily reminder (format: HH:MM)',
    reminderIntervalTitle: 'Reminder Interval',
    reminderIntervalDesc: 'Select interval between reminders (in hours). 0 = disabled',
    disabled: 'Disabled',
    hours: 'h',
    resetSessionTitle: 'Reset Session',
    resetSessionConfirm: 'Are you sure you want to reset the current session?',
    resetAllTitle: 'Reset All Data',
    resetAllConfirm: 'Are you sure you want to reset all data? This action cannot be undone.',
    confirmation: 'Confirmation',
    resetAllConfirm2: 'This will delete ALL data. Are you absolutely sure?',
    importTitle: 'Import Data',
    importDesc: 'Paste JSON data to import',
    importPlaceholder: 'Paste JSON data...',
    importError: 'Enter data to import',
    exportSuccess: 'Data exported successfully',
    exportError: 'Failed to export data',
    importSuccess: 'Data imported successfully',
    importErrorFormat: 'Invalid data format',
    deleteZikr: 'Delete Zikr',
    deleteZikrConfirm: 'Are you sure you want to delete this zikr type?',
    enterZikrName: 'Enter zikr name',
    timeFormatError: 'Enter time in HH:MM format (e.g., 09:00)',
    goalError: 'Enter a number from 1 to 10000',
    permission: 'Permission',
    notificationPermission: 'Permission is required for notifications. Please enable notifications in device settings.',
    notificationPermissionApp: 'Permission is required for notifications. Please enable notifications in app settings.',
    goalAchieved: '🎉 Congratulations!',
    goalAchievedText: 'You have reached today\'s goal: {goal} zikr!',
    allDataReset: 'All data reset successfully',
    resetError: 'Error resetting data',
    error: 'Error',
    success: 'Success',
  },
  ar: {
    name: 'العربية',
    counter: 'عداد الذكر',
    today: 'اليوم',
    yesterday: 'أمس',
    history: 'التاريخ',
    stats: 'الإحصائيات',
    settings: 'الإعدادات',
    currentSession: 'الجلسة الحالية',
    selectZikr: 'اضغط للاختيار',
    selectZikrTitle: 'اختر الذكر',
    addZikr: 'إضافة ذكر',
    addNewZikr: '+ إضافة ذكر جديد',
    resetSession: 'إعادة تعيين الجلسة',
    resetAll: 'إعادة تعيين جميع البيانات',
    achievements: 'الإنجازات',
    viewAchievements: 'عرض الإنجازات',
    export: 'تصدير البيانات',
    import: 'استيراد البيانات',
    theme: 'المظهر',
    language: 'اللغة',
    sounds: 'الأصوات',
    notifications: 'الإشعارات',
    vibration: 'الاهتزاز',
    vibrationDesc: 'الاهتزاز عند كل ذكر',
    reminders: 'التذكيرات',
    remindersDesc: 'إشعارات الذكر',
    dailyReminderTime: 'وقت التذكير اليومي',
    dailyReminderTimeDesc: 'وقت الإشعار اليومي',
    reminderInterval: 'فترة التذكير',
    reminderIntervalDesc: 'كل N ساعة (0 = معطل)',
    goals: 'الأهداف',
    dailyGoal: 'الهدف اليومي',
    dailyGoalDesc: 'عدد الأذكار لتحقيق الهدف',
    soundsDesc: 'تأثيرات صوتية عند الذكر',
    data: 'البيانات',
    sessionTimer: 'مؤقت الجلسة',
    speed: 'السرعة',
    perMinute: 'في الدقيقة',
    totalAllTime: 'المجموع الكلي',
    byTimeOfDay: 'حسب وقت اليوم',
    byType: 'حسب النوع',
    charts: 'الرسوم البيانية',
    week: 'الأسبوع',
    month: 'الشهر',
    calendar: 'التقويم',
    zikrName: 'اسم الذكر *',
    zikrNameHint: 'أدخل الاسم باللاتينية',
    arabicText: 'النص العربي',
    arabicTextHint: 'اختياري. أدخل النص العربي',
    cancel: 'إلغاء',
    add: 'إضافة',
    save: 'حفظ',
    delete: 'حذف',
    reset: 'إعادة تعيين',
    historyEmpty: 'التاريخ فارغ',
    historyEmptyDesc: 'ابدأ في أداء الذكر لرؤية الإحصائيات',
    zikr: 'ذكر',
    averagePerDay: 'المتوسط في اليوم',
    bestDay: 'أفضل يوم',
    totalDays: 'إجمالي الأيام',
    daysStreak: 'أيام متتالية',
    notEnoughData: 'بيانات غير كافية',
    needMinHistory: 'يحتاج إلى إدخال واحد على الأقل في التاريخ',
    notificationTimeTitle: 'وقت الإشعار',
    notificationTimeDesc: 'اختر وقت التذكير اليومي (التنسيق: HH:MM)',
    reminderIntervalTitle: 'فترة التذكير',
    reminderIntervalDesc: 'اختر الفترة بين التذكيرات (بالساعات). 0 = معطل',
    disabled: 'معطل',
    hours: 'س',
    resetSessionTitle: 'إعادة تعيين الجلسة',
    resetSessionConfirm: 'هل أنت متأكد أنك تريد إعادة تعيين الجلسة الحالية؟',
    resetAllTitle: 'إعادة تعيين جميع البيانات',
    resetAllConfirm: 'هل أنت متأكد أنك تريد إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
    confirmation: 'تأكيد',
    resetAllConfirm2: 'سيؤدي هذا إلى حذف جميع البيانات. هل أنت متأكد تمامًا؟',
    importTitle: 'استيراد البيانات',
    importDesc: 'الصق بيانات JSON للاستيراد',
    importPlaceholder: 'الصق بيانات JSON...',
    importError: 'أدخل البيانات للاستيراد',
    exportSuccess: 'تم تصدير البيانات بنجاح',
    exportError: 'فشل تصدير البيانات',
    importSuccess: 'تم استيراد البيانات بنجاح',
    importErrorFormat: 'تنسيق بيانات غير صالح',
    deleteZikr: 'حذف الذكر',
    deleteZikrConfirm: 'هل أنت متأكد أنك تريد حذف نوع الذكر هذا؟',
    enterZikrName: 'أدخل اسم الذكر',
    timeFormatError: 'أدخل الوقت بتنسيق HH:MM (مثل 09:00)',
    goalError: 'أدخل رقمًا من 1 إلى 10000',
    permission: 'الإذن',
    notificationPermission: 'الإذن مطلوب للإشعارات. يرجى تمكين الإشعارات في إعدادات الجهاز.',
    notificationPermissionApp: 'الإذن مطلوب للإشعارات. يرجى تمكين الإشعارات في إعدادات التطبيق.',
    goalAchieved: '🎉 تهانينا!',
    goalAchievedText: 'لقد حققت الهدف اليوم: {goal} ذكر!',
    allDataReset: 'تم إعادة تعيين جميع البيانات بنجاح',
    resetError: 'خطأ في إعادة تعيين البيانات',
    error: 'خطأ',
    success: 'نجاح',
  },
  uz: {
    name: "O'zbek",
    counter: 'Zikr Hisoblagichi',
    today: 'Bugun',
    yesterday: 'Kecha',
    history: 'Tarix',
    stats: 'Statistika',
    settings: 'Sozlamalar',
    currentSession: 'Joriy Sessiya',
    selectZikr: 'Tanlash uchun bosing',
    selectZikrTitle: 'Zikrni tanlang',
    addZikr: 'Zikr qo\'shish',
    addNewZikr: '+ Yangi zikr qo\'shish',
    resetSession: 'Sessiyani qayta tiklash',
    resetAll: 'Barcha ma\'lumotlarni qayta tiklash',
    achievements: 'Yutuqlar',
    viewAchievements: 'Yutuqlarni ko\'rish',
    export: 'Ma\'lumotlarni eksport qilish',
    import: 'Ma\'lumotlarni import qilish',
    theme: 'Mavzu',
    language: 'Til',
    sounds: 'Ovozlar',
    notifications: 'Bildirishnomalar',
    vibration: 'Titrash',
    vibrationDesc: 'Har bir zikrda titrash',
    reminders: 'Eslatmalar',
    remindersDesc: 'Zikr bildirishnomalari',
    dailyReminderTime: 'Kunlik eslatma vaqti',
    dailyReminderTimeDesc: 'Kunlik bildirishnoma vaqti',
    reminderInterval: 'Eslatma intervali',
    reminderIntervalDesc: 'Har N soatda (0 = o\'chirilgan)',
    goals: 'Maqsadlar',
    dailyGoal: 'Kunlik maqsad',
    dailyGoalDesc: 'Maqsadga erishish uchun zikr soni',
    soundsDesc: 'Zikrda ovoz effektlari',
    data: 'Ma\'lumotlar',
    sessionTimer: 'Sessiya Taymeri',
    speed: 'Tezlik',
    perMinute: 'daqiqada',
    totalAllTime: 'Jami vaqt',
    byTimeOfDay: 'Kun vaqti bo\'yicha',
    byType: 'Tur bo\'yicha',
    charts: 'Grafiklar',
    week: 'Hafta',
    month: 'Oy',
    calendar: 'Taqvim',
    zikrName: 'Zikr nomi *',
    zikrNameHint: 'Nomni lotincha kiriting',
    arabicText: 'Arabcha matn',
    arabicTextHint: 'Ixtiyoriy. Arabcha matn kiriting',
    cancel: 'Bekor qilish',
    add: 'Qo\'shish',
    save: 'Saqlash',
    delete: 'O\'chirish',
    reset: 'Qayta tiklash',
    historyEmpty: 'Tarix bo\'sh',
    historyEmptyDesc: 'Statistikani ko\'rish uchun zikr qilishni boshlang',
    zikr: 'zikr',
    averagePerDay: 'Kuniga o\'rtacha',
    bestDay: 'Eng yaxshi kun',
    totalDays: 'Jami kunlar',
    daysStreak: 'Ketma-ket kunlar',
    notEnoughData: 'Ma\'lumotlar yetarli emas',
    needMinHistory: 'Tarixda kamida 1 yozuv kerak',
    notificationTimeTitle: 'Bildirishnoma vaqti',
    notificationTimeDesc: 'Kunlik eslatma vaqtini tanlang (format: HH:MM)',
    reminderIntervalTitle: 'Eslatma intervali',
    reminderIntervalDesc: 'Eslatmalar orasidagi intervalni tanlang (soatlarda). 0 = o\'chirilgan',
    disabled: 'O\'chirilgan',
    hours: 'soat',
    resetSessionTitle: 'Sessiyani qayta tiklash',
    resetSessionConfirm: 'Joriy sessiyani qayta tiklashni xohlaysizmi?',
    resetAllTitle: 'Barcha ma\'lumotlarni qayta tiklash',
    resetAllConfirm: 'Barcha ma\'lumotlarni qayta tiklashni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.',
    confirmation: 'Tasdiqlash',
    resetAllConfirm2: 'Bu BARCHA ma\'lumotlarni o\'chiradi. Siz mutlaqo ishonchingiz komilmi?',
    importTitle: 'Ma\'lumotlarni import qilish',
    importDesc: 'Import qilish uchun JSON ma\'lumotlarini yopishtiring',
    importPlaceholder: 'JSON ma\'lumotlarini yopishtiring...',
    importError: 'Import qilish uchun ma\'lumotlarni kiriting',
    exportSuccess: 'Ma\'lumotlar muvaffaqiyatli eksport qilindi',
    exportError: 'Ma\'lumotlarni eksport qilishda xatolik',
    importSuccess: 'Ma\'lumotlar muvaffaqiyatli import qilindi',
    importErrorFormat: 'Noto\'g\'ri ma\'lumot formati',
    deleteZikr: 'Zikrni o\'chirish',
    deleteZikrConfirm: 'Bu zikr turini o\'chirishni xohlaysizmi?',
    enterZikrName: 'Zikr nomini kiriting',
    timeFormatError: 'Vaqtni HH:MM formatida kiriting (masalan, 09:00)',
    goalError: '1 dan 10000 gacha raqam kiriting',
    permission: 'Ruxsat',
    notificationPermission: 'Bildirishnomalar uchun ruxsat kerak. Iltimos, qurilma sozlamalarida bildirishnomalarni yoqing.',
    notificationPermissionApp: 'Bildirishnomalar uchun ruxsat kerak. Iltimos, ilova sozlamalarida bildirishnomalarni yoqing.',
    goalAchieved: '🎉 Tabriklaymiz!',
    goalAchievedText: 'Siz bugungi maqsadga erishdingiz: {goal} zikr!',
    allDataReset: 'Barcha ma\'lumotlar muvaffaqiyatli qayta tiklandi',
    resetError: 'Ma\'lumotlarni qayta tiklashda xatolik',
    error: 'Xatolik',
    success: 'Muvaffaqiyat',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('counter');
  const [zikrTypes, setZikrTypes] = useState(DEFAULT_ZIKR_TYPES);
  const [zikrType, setZikrType] = useState(DEFAULT_ZIKR_TYPES[0].id);
  const [counts, setCounts] = useState({});
  const [todayCount, setTodayCount] = useState(0);
  const [todayCounts, setTodayCounts] = useState({});
  const [history, setHistory] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(100);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showZikrSelector, setShowZikrSelector] = useState(false);
  const [showAddZikr, setShowAddZikr] = useState(false);
  const [newZikrName, setNewZikrName] = useState('');
  const [newZikrArabic, setNewZikrArabic] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showResetSessionConfirm, setShowResetSessionConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [showResetAllConfirm2, setShowResetAllConfirm2] = useState(false);
  // Новые состояния для расширенных функций
  const [achievements, setAchievements] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00'); // Время уведомления
  const [notificationInterval, setNotificationInterval] = useState(3); // Интервал в часах
  const [showNotificationTimePicker, setShowNotificationTimePicker] = useState(false);
  const [showNotificationIntervalPicker, setShowNotificationIntervalPicker] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [chartPeriod, setChartPeriod] = useState('week'); // 'week' or 'month'
  const [showAchievements, setShowAchievements] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDataText, setImportDataText] = useState('');
  const [totalAllTime, setTotalAllTime] = useState(0);
  const [goalAchievedCount, setGoalAchievedCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const isDataLoadedRef = React.useRef(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const lastDateRef = React.useRef('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const audioSoundRef = React.useRef(null);
  const sessionTimerRef = React.useRef(null);
  const bismillahPlayedRef = React.useRef(false); // Флаг для отслеживания воспроизведения Бисмиллах
  const playBismillahRef = React.useRef(null); // Ref для хранения функции playBismillah
  const COLORS_THEME = THEMES[currentTheme] || THEMES.default;
  
  // Telegram интеграция
  const [telegramUser, setTelegramUser] = useState(null);
  const telegramWebAppRef = React.useRef(null);
  const lastSyncRef = React.useRef(null);

  // Проверка, запущено ли в Telegram
  const isTelegram = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
    return !!window.Telegram?.WebApp;
  };

  // Инициализация Telegram Web App
  const initTelegramWebApp = () => {
    if (!isTelegram()) return null;
    
    const tg = window.Telegram.WebApp;
    telegramWebAppRef.current = tg;
    
    // Готовим приложение к показу
    tg.ready();
    
    // Разворачиваем на весь экран
    tg.expand();
    
    // Устанавливаем цвета темы
    tg.setHeaderColor('#004734');
    tg.setBackgroundColor('#004734');
    
    // Включаем закрытие по свайпу вниз
    tg.enableClosingConfirmation();
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
      setTelegramUser(user);
      console.log('Telegram user:', user);
      console.log('Telegram HapticFeedback доступен:', !!tg.HapticFeedback);
      
      // Автоматический выбор языка на основе языка Telegram
      if (user.language_code) {
        const langMap = {
          'ru': 'ru',
          'en': 'en',
          'ar': 'ar',
          'uz': 'uz',
          'uk': 'ru', // Украинский -> русский
          'kk': 'ru', // Казахский -> русский
        };
        const detectedLang = langMap[user.language_code] || 'ru';
        if (detectedLang !== currentLanguage) {
          setCurrentLanguage(detectedLang);
          console.log(`Язык автоматически выбран: ${detectedLang} (из ${user.language_code})`);
        }
      }
    }
    
    // Тест вибрации при инициализации (только один раз)
    if (tg.HapticFeedback && vibrationEnabled) {
      setTimeout(() => {
        try {
          tg.HapticFeedback.impactOccurred('light');
          console.log('✅ Тест вибрации: успешно');
        } catch (error) {
          console.error('❌ Тест вибрации: ошибка', error);
        }
      }, 1000);
    }
    
    // Обработчик события закрытия Mini App - отправляем данные
    tg.onEvent('viewportChanged', (event) => {
      // При изменении viewport (например, при закрытии) отправляем данные
      if (event.isStateStable) {
        syncDataWithBot();
      }
    });
    
    // Обработчик закрытия приложения
    tg.onEvent('close', () => {
      // При закрытии отправляем финальные данные
      syncDataWithBot();
    });
    
    // Периодическая синхронизация каждые 30 секунд
    const syncInterval = setInterval(() => {
      if (isTelegram() && telegramWebAppRef.current) {
        syncDataWithBot();
      }
    }, 30000);
    
    // Сохраняем интервал для очистки
    if (typeof window !== 'undefined') {
      window._telegramSyncInterval = syncInterval;
    }
    
    return tg;
  };

  // Улучшенная вибрация с поддержкой Telegram Haptic Feedback
  const vibrateWithTelegram = (pattern) => {
    if (!vibrationEnabled) return;
    
    // Если запущено в Telegram, используем Haptic Feedback
    if (isTelegram()) {
      const tg = telegramWebAppRef.current || (typeof window !== 'undefined' ? window.Telegram?.WebApp : null);
      
      if (tg?.HapticFeedback) {
        const haptic = tg.HapticFeedback;
        
        try {
          if (typeof pattern === 'number') {
            // Простая вибрация
            haptic.impactOccurred('light');
            console.log('📳 Telegram Haptic: light');
          } else if (Array.isArray(pattern)) {
            // Сложная вибрация - используем medium для массива
            haptic.impactOccurred('medium');
            console.log('📳 Telegram Haptic: medium');
            // Для специальных случаев (каждые 33 зикра)
            if (pattern.length > 2) {
              setTimeout(() => {
                haptic.notificationOccurred('success');
                console.log('📳 Telegram Haptic: success');
              }, 100);
            }
          }
          return;
        } catch (error) {
          console.error('Ошибка Telegram Haptic Feedback:', error);
        }
      } else {
        console.warn('⚠️ Telegram HapticFeedback недоступен');
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

  // Синхронизация данных с ботом
  const syncDataWithBot = useCallback(() => {
    if (!isTelegram() || !telegramWebAppRef.current) return;
    
    const tg = telegramWebAppRef.current;
    
    // Подготавливаем данные для синхронизации
    const syncData = {
      type: 'sync',
      todayCount,
      totalAllTime,
      streakDays,
      dailyGoal,
      history: history.slice(-30), // Последние 30 дней
      achievements,
      counts,
      todayCounts,
      lastSync: new Date().toISOString(),
    };
    
    // Сохраняем данные в localStorage для надежности
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('misbaha_sync_data', JSON.stringify(syncData));
        localStorage.setItem('misbaha_last_sync', new Date().toISOString());
      }
    } catch (e) {
      console.log('Не удалось сохранить в localStorage:', e);
    }
    
    // Отправляем данные через sendData
    try {
      if (tg.sendData) {
        tg.sendData(JSON.stringify(syncData));
        lastSyncRef.current = new Date();
        console.log('✅ Данные отправлены в бот:', {
          todayCount,
          totalAllTime,
          streakDays
        });
      } else {
        console.warn('⚠️ sendData недоступен');
      }
    } catch (error) {
      console.error('Ошибка синхронизации данных:', error);
    }
  }, [todayCount, totalAllTime, streakDays, dailyGoal, history, achievements, counts, todayCounts]);

  // Отправка статистики в бот
  const sendStatsToBot = useCallback(() => {
    if (!isTelegram() || !telegramWebAppRef.current) return;
    
    const tg = telegramWebAppRef.current;
    const statsData = {
      type: 'stats',
      todayCount,
      totalAllTime,
      streakDays,
      dailyGoal,
      progress: dailyGoal > 0 ? Math.round((todayCount / dailyGoal) * 100) : 0,
      history: history.slice(-30),
      achievements,
      counts,
      todayCounts,
      lastSync: new Date().toISOString(),
    };
    
    // Вычисляем статистику
    if (history.length > 0) {
      const totals = history.map(h => h.total);
      statsData.average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
      statsData.bestDay = Math.max(...totals);
      statsData.totalDays = history.length;
    } else {
      statsData.average = 0;
      statsData.bestDay = 0;
      statsData.totalDays = 0;
    }
    
    statsData.achievementsCount = achievements.length;
    
    try {
      tg.sendData(JSON.stringify(statsData));
      console.log('✅ Статистика отправлена в бот');
    } catch (error) {
      console.error('Ошибка отправки статистики:', error);
    }
  }, [todayCount, totalAllTime, streakDays, dailyGoal, history, achievements, counts, todayCounts]);

  // Настройка обработчика уведомлений
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  }, []);

  // Инициализация Telegram при загрузке
  useEffect(() => {
    if (Platform.OS === 'web') {
      initTelegramWebApp();
    }
  }, []);

  // Определяем playBismillah как обычную функцию, чтобы избежать проблем с порядком инициализации
  const playBismillah = async () => {
    try {
      if (Platform.OS === 'web') {
        // Для веба используем HTML5 Audio API (нативный браузерный Audio)
        try {
          // На вебе используем публичный путь к аудио файлу
          const audioPath = '/misbaha/assets/assets/bismillah.mp3';
          // Используем нативный браузерный Audio напрямую через window
          if (typeof window !== 'undefined' && window.Audio) {
            const audio = new window.Audio(audioPath);
            audio.volume = 0.7;
            
            // Пытаемся воспроизвести, но если автовоспроизведение заблокировано, это нормально
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.log('Аудио не может быть воспроизведено автоматически:', error);
                // На вебе автовоспроизведение может быть заблокировано браузером
                // Это нормально для iOS Safari
              });
            }
          } else {
            console.log('HTML5 Audio API не поддерживается в этом браузере');
          }
        } catch (audioError) {
          console.log('Аудио файл не найден для веба:', audioError);
        }
      } else {
        // Для мобильных устройств используем expo-av
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        // Загружаем и воспроизводим аудио файл Бисмиллах
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('./assets/bismillah.mp3'),
            { shouldPlay: true, volume: 0.7 }
          );
          
          audioSoundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
              audioSoundRef.current = null;
            }
          });
        } catch (audioError) {
          console.log('Аудио файл не найден, продолжаем без звука:', audioError);
        }
      }
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
    }
  };
  
  // Сохраняем функцию в ref для стабильной ссылки
  playBismillahRef.current = playBismillah;

  // Загрузка сохраненных данных при запуске
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Загружаем данные
      await loadData();
      
      // НЕ воспроизводим звук Бисмиллах автоматически для веба
      // Браузеры блокируют автовоспроизведение без взаимодействия пользователя
      // Звук будет воспроизведен при первом взаимодействии пользователя (первый зикр)
      if (Platform.OS !== 'web' && playBismillahRef.current) {
        await playBismillahRef.current();
      }
      
      // Персонализированное приветствие для Telegram пользователей
      if (telegramUser && isTelegram()) {
        const firstName = telegramUser.first_name || 'Пользователь';
        const greeting = currentLanguage === 'ar' 
          ? `مرحباً ${firstName}!` 
          : currentLanguage === 'en'
          ? `Welcome, ${firstName}!`
          : currentLanguage === 'uz'
          ? `Xush kelibsiz, ${firstName}!`
          : `Добро пожаловать, ${firstName}!`;
        
        console.log(`👋 ${greeting}`);
      }
      
      // Небольшая задержка для показа экрана загрузки
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    // Анимация появления текста
    if (isLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  // Проверка нового дня
  useEffect(() => {
    checkNewDay();
  }, []);

  // Сохранение данных при изменении
  useEffect(() => {
    if (isDataLoadedRef.current) {
      saveData();
      saveTodayData();
      // Сохраняем текущий день в историю только если счетчик больше 0
      if (todayCount > 0) {
        const today = new Date().toDateString();
        saveHistoryEntry(today, todayCount, todayCounts);
      }
      
      // Синхронизация с ботом (не чаще раза в 10 секунд)
      if (isTelegram() && (!lastSyncRef.current || (new Date() - lastSyncRef.current) > 10000)) {
        // Используем setTimeout для асинхронной отправки
        setTimeout(() => {
          syncDataWithBot();
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCount, dailyGoal, vibrationEnabled, counts, todayCounts, zikrTypes, achievements, currentTheme, currentLanguage, soundsEnabled, notificationsEnabled, notificationTime, notificationInterval, totalAllTime, goalAchievedCount, streakDays, syncDataWithBot]);

  const checkNewDay = () => {
    const today = new Date().toDateString();
    if (lastDateRef.current && lastDateRef.current !== today) {
      // Сохраняем вчерашний день в историю
      if (lastDateRef.current) {
        saveHistoryEntry(lastDateRef.current, todayCount, todayCounts);
      }
      resetTodayCounts();
    }
    lastDateRef.current = today;
  };

  const loadData = async () => {
    try {
      const savedTypes = await AsyncStorage.getItem('zikrTypes');
      const savedGoal = await AsyncStorage.getItem('dailyGoal');
      const savedVibration = await AsyncStorage.getItem('vibrationEnabled');
      const savedCounts = await AsyncStorage.getItem('zikrCounts');
      const savedTodayCounts = await AsyncStorage.getItem('todayZikrCounts');
      const savedHistory = await AsyncStorage.getItem('zikrHistory');
      const savedToday = await AsyncStorage.getItem('todayZikr');
      
      if (savedTypes !== null) {
        setZikrTypes(JSON.parse(savedTypes));
      }

      if (savedGoal !== null) {
        setDailyGoal(parseInt(savedGoal));
      }

      if (savedVibration !== null) {
        setVibrationEnabled(savedVibration === 'true');
      } else {
        // По умолчанию вибрация включена
        setVibrationEnabled(true);
      }

      if (savedCounts !== null) {
        setCounts(JSON.parse(savedCounts));
      }

      if (savedTodayCounts !== null) {
        setTodayCounts(JSON.parse(savedTodayCounts));
      } else {
        initializeCounts();
      }

      if (savedHistory !== null) {
        setHistory(JSON.parse(savedHistory));
      }

      if (savedToday !== null) {
        setTodayCount(parseInt(savedToday));
      }

      // Загружаем новые данные
      const savedAchievements = await AsyncStorage.getItem('achievements');
      const savedTheme = await AsyncStorage.getItem('currentTheme');
      const savedLanguage = await AsyncStorage.getItem('currentLanguage');
      const savedSounds = await AsyncStorage.getItem('soundsEnabled');
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const savedTotalAllTime = await AsyncStorage.getItem('totalAllTime');
      const savedGoalAchievedCount = await AsyncStorage.getItem('goalAchievedCount');
      const savedStreakDays = await AsyncStorage.getItem('streakDays');

      if (savedAchievements !== null) {
        setAchievements(JSON.parse(savedAchievements));
      }
      if (savedTheme !== null) {
        setCurrentTheme(savedTheme);
      }
      if (savedLanguage !== null) {
        setCurrentLanguage(savedLanguage);
      }
      if (savedSounds !== null) {
        setSoundsEnabled(savedSounds === 'true');
      }
      if (savedNotifications !== null) {
        setNotificationsEnabled(savedNotifications === 'true');
      }
      if (savedTotalAllTime !== null) {
        setTotalAllTime(parseInt(savedTotalAllTime));
      }
      if (savedGoalAchievedCount !== null) {
        setGoalAchievedCount(parseInt(savedGoalAchievedCount));
      }
      if (savedStreakDays !== null) {
        setStreakDays(parseInt(savedStreakDays));
      }

      const savedNotificationTime = await AsyncStorage.getItem('notificationTime');
      const savedNotificationInterval = await AsyncStorage.getItem('notificationInterval');

      if (savedNotificationTime !== null) {
        setNotificationTime(savedNotificationTime);
      }
      if (savedNotificationInterval !== null) {
        setNotificationInterval(parseInt(savedNotificationInterval));
      }

      initializeCounts();
      isDataLoadedRef.current = true;
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      initializeCounts();
      isDataLoadedRef.current = true;
    }
  };

  const initializeCounts = () => {
    const initialCounts = {};
    const initialTodayCounts = {};
    zikrTypes.forEach(type => {
      if (!counts[type.id]) {
        initialCounts[type.id] = 0;
      }
      if (!todayCounts[type.id]) {
        initialTodayCounts[type.id] = 0;
      }
    });
    if (Object.keys(initialCounts).length > 0) {
      setCounts({ ...counts, ...initialCounts });
    }
    if (Object.keys(initialTodayCounts).length > 0) {
      setTodayCounts({ ...todayCounts, ...initialTodayCounts });
    }
  };

  const resetTodayCounts = () => {
    const resetCounts = {};
    zikrTypes.forEach(type => {
      resetCounts[type.id] = 0;
    });
    setTodayCounts(resetCounts);
    setTodayCount(0);
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('zikrTypes', JSON.stringify(zikrTypes));
      await AsyncStorage.setItem('dailyGoal', dailyGoal.toString());
      await AsyncStorage.setItem('vibrationEnabled', vibrationEnabled.toString());
      await AsyncStorage.setItem('zikrCounts', JSON.stringify(counts));
      // Сохраняем новые данные
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
      await AsyncStorage.setItem('currentTheme', currentTheme);
      await AsyncStorage.setItem('currentLanguage', currentLanguage);
      await AsyncStorage.setItem('soundsEnabled', soundsEnabled.toString());
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      await AsyncStorage.setItem('totalAllTime', totalAllTime.toString());
      await AsyncStorage.setItem('goalAchievedCount', goalAchievedCount.toString());
      await AsyncStorage.setItem('streakDays', streakDays.toString());
      await AsyncStorage.setItem('notificationTime', notificationTime);
      await AsyncStorage.setItem('notificationInterval', notificationInterval.toString());
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  };

  const saveTodayData = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`todayZikr_${today}`, todayCount.toString());
      await AsyncStorage.setItem(`todayZikrCounts_${today}`, JSON.stringify(todayCounts));
      await AsyncStorage.setItem('todayZikr', todayCount.toString());
      await AsyncStorage.setItem('todayZikrCounts', JSON.stringify(todayCounts));
    } catch (error) {
      console.error('Ошибка сохранения данных за сегодня:', error);
    }
  };

  const saveHistoryEntry = async (dateToSave = null, countToSave = null, countsToSave = null) => {
    try {
      const date = dateToSave || new Date().toDateString();
      const total = countToSave !== null ? countToSave : todayCount;
      const countsData = countsToSave || { ...todayCounts };
      
      // Используем функциональное обновление состояния
      setHistory(prevHistory => {
        // Проверяем, есть ли уже запись за этот день
        const existingIndex = prevHistory.findIndex(h => h.date === date);
        
        let newHistory;
        if (existingIndex >= 0) {
          // Обновляем существующую запись
          newHistory = [...prevHistory];
          newHistory[existingIndex] = {
            date: date,
            total: total,
            counts: countsData,
          };
        } else {
          // Добавляем новую запись
          const entry = {
            date: date,
            total: total,
            counts: countsData,
          };
          newHistory = [...prevHistory, entry];
        }
        
        const trimmedHistory = newHistory.slice(-30);
        
        // Сохраняем в AsyncStorage
        AsyncStorage.setItem('zikrHistory', JSON.stringify(trimmedHistory)).catch(error => {
          console.error('Ошибка сохранения истории:', error);
        });
        
        return trimmedHistory;
      });
    } catch (error) {
      console.error('Ошибка сохранения истории:', error);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const vibrate = (pattern) => {
    // Используем улучшенную вибрацию с поддержкой Telegram
    vibrateWithTelegram(pattern);
  };

  const incrementCount = () => {
    const newCount = (counts[zikrType] || 0) + 1;
    const newTotal = todayCount + 1;
    const newTodayCounts = { ...todayCounts };
    newTodayCounts[zikrType] = (newTodayCounts[zikrType] || 0) + 1;
    
    setCounts({ ...counts, [zikrType]: newCount });
    setTodayCount(newTotal);
    setTodayCounts(newTodayCounts);
    
    animateButton();
    
    // Воспроизводим звук Бисмиллах при первом взаимодействии пользователя (для веба)
    if (Platform.OS === 'web' && soundsEnabled && !bismillahPlayedRef.current) {
      bismillahPlayedRef.current = true;
      if (playBismillahRef.current) {
        playBismillahRef.current();
      }
    }
    
    // Вибрация - вызываем сразу, без задержки
    if (vibrationEnabled) {
      // Вызываем вибрацию сразу при пользовательском действии
      vibrate(50);
      
      // Специальная вибрация каждые 33 зикра
      if (newCount % 33 === 0) {
        // Используем небольшую задержку для второй вибрации
        setTimeout(() => {
          vibrate([100, 50, 100]);
        }, 150);
      }
    }

    if (newTotal === dailyGoal) {
      setGoalAchievedCount(goalAchievedCount + 1);
      if (soundsEnabled) {
        // Воспроизводим звук достижения цели
        playSound('goal');
      }
      
      // Специальная вибрация для достижения цели в Telegram
      if (isTelegram() && telegramWebAppRef.current?.HapticFeedback) {
        telegramWebAppRef.current.HapticFeedback.notificationOccurred('success');
      }
      
      // Отправляем статистику в бот при достижении цели
      if (isTelegram()) {
        sendStatsToBot();
      }
      
      Alert.alert(t.goalAchieved, t.goalAchievedText.replace('{goal}', dailyGoal));
    }
  };

  // Воспроизведение звуков
  const playSound = async (type) => {
    if (!soundsEnabled) return;
    try {
      // Здесь можно добавить разные звуки для разных типов
      // Пока используем простую вибрацию
      if (vibrationEnabled) {
        vibrate([100, 50, 100, 50, 100]);
      }
    } catch (error) {
      console.log('Ошибка воспроизведения звука:', error);
    }
  };

  const decrementCount = () => {
    if ((counts[zikrType] || 0) > 0) {
      const newCount = counts[zikrType] - 1;
      const newTotal = todayCount > 0 ? todayCount - 1 : 0;
      const newTodayCounts = { ...todayCounts };
      if (newTodayCounts[zikrType] > 0) {
        newTodayCounts[zikrType] = newTodayCounts[zikrType] - 1;
      }
      
      setCounts({ ...counts, [zikrType]: newCount });
      setTodayCount(newTotal);
      setTodayCounts(newTodayCounts);
    }
  };

  const handleZikrNameChange = useCallback((text) => {
    setNewZikrName(text);
    
    // Автоматическое заполнение арабского текста
    if (text.trim()) {
      const textLower = text.toLowerCase().trim();
      
      // Проверяем точное совпадение
      if (ZIKR_ARABIC_MAP[textLower]) {
        setNewZikrArabic(ZIKR_ARABIC_MAP[textLower]);
        return;
      }
      
      // Проверяем частичное совпадение
      for (const [key, arabic] of Object.entries(ZIKR_ARABIC_MAP)) {
        if (textLower.includes(key) || key.includes(textLower)) {
          setNewZikrArabic(arabic);
          return;
        }
      }
      
      // Проверяем в существующих зикрах
      const existingZikr = zikrTypes.find(z => 
        z.name.toLowerCase().includes(textLower) || 
        textLower.includes(z.name.toLowerCase())
      );
      if (existingZikr && existingZikr.arabic) {
        setNewZikrArabic(existingZikr.arabic);
        return;
      }
    } else {
      // Если поле пустое, очищаем арабский текст
      setNewZikrArabic('');
    }
  }, [zikrTypes]);

  const addCustomZikr = () => {
    if (newZikrName.trim() === '') {
      Alert.alert(t.error, t.enterZikrName);
      return;
    }

    const newId = `custom_${Date.now()}`;
    const newZikr = {
      id: newId,
      name: newZikrName.trim(),
      arabic: newZikrArabic.trim() || newZikrName.trim(),
      custom: true,
    };

    setZikrTypes([...zikrTypes, newZikr]);
    setCounts({ ...counts, [newId]: 0 });
    setTodayCounts({ ...todayCounts, [newId]: 0 });
    setZikrType(newId);
    setNewZikrName('');
    setNewZikrArabic('');
    setShowAddZikr(false);
  };

  const deleteCustomZikr = (id) => {
    Alert.alert(
      t.deleteZikr,
      t.deleteZikrConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            const zikr = zikrTypes.find(z => z.id === id);
            if (zikr && zikr.custom) {
              const newTypes = zikrTypes.filter(z => z.id !== id);
              setZikrTypes(newTypes);
              if (zikrType === id && newTypes.length > 0) {
                setZikrType(newTypes[0].id);
              }
            }
          },
        },
      ]
    );
  };

  const resetSession = () => {
    if (Platform.OS === 'web') {
      // Для веба показываем модальное окно подтверждения
      setShowResetSessionConfirm(true);
    } else {
      Alert.alert(
        t.resetSessionTitle,
        t.resetSessionConfirm,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.reset,
            style: 'destructive',
            onPress: () => {
              const resetCounts = {};
              zikrTypes.forEach(type => {
                resetCounts[type.id] = 0;
              });
              setCounts(resetCounts);
            },
          },
        ]
      );
    }
  };

  const confirmResetSession = () => {
    const resetCounts = {};
    zikrTypes.forEach(type => {
      resetCounts[type.id] = 0;
    });
    setCounts(resetCounts);
    setSessionStartTime(null);
    setSessionDuration(0);
    setShowResetSessionConfirm(false);
  };

  const resetAll = async () => {
    if (Platform.OS === 'web') {
      // Для веба показываем первое модальное окно подтверждения
      setShowResetAllConfirm(true);
    } else {
      Alert.alert(
        t.resetAllTitle,
        t.resetAllConfirm,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.reset,
            style: 'destructive',
            onPress: async () => {
              // Показываем второе подтверждение
              Alert.alert(
                t.confirmation,
                t.resetAllConfirm2,
                [
                  { text: t.cancel, style: 'cancel' },
                  {
                    text: t.reset,
                    style: 'destructive',
                    onPress: async () => {
                      const resetCounts = {};
                      zikrTypes.forEach(type => {
                        resetCounts[type.id] = 0;
                      });
                      setCounts(resetCounts);
                      setTodayCount(0);
                      resetTodayCounts();
                      setHistory([]);
                      try {
                        await AsyncStorage.clear();
                        setZikrTypes(DEFAULT_ZIKR_TYPES);
                        setZikrType(DEFAULT_ZIKR_TYPES[0].id);
                        setDailyGoal(100);
                        setVibrationEnabled(true);
                      } catch (error) {
                        console.error('Ошибка очистки данных:', error);
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const confirmResetAll = () => {
    // Закрываем первое окно и показываем второе
    setShowResetAllConfirm(false);
    setShowResetAllConfirm2(true);
  };

  const confirmResetAll2 = async () => {
    const resetCounts = {};
    zikrTypes.forEach(type => {
      resetCounts[type.id] = 0;
    });
    setCounts(resetCounts);
    setTodayCount(0);
    resetTodayCounts();
    setHistory([]);
    try {
      await AsyncStorage.clear();
      setZikrTypes(DEFAULT_ZIKR_TYPES);
      setZikrType(DEFAULT_ZIKR_TYPES[0].id);
      setDailyGoal(100);
      setVibrationEnabled(true);
      setShowResetAllConfirm2(false);
      if (Platform.OS === 'web') {
        alert(t.allDataReset);
      }
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      if (Platform.OS === 'web') {
        alert(t.resetError);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toDateString()) {
      return t.today;
    } else if (dateString === yesterday.toDateString()) {
      return t.yesterday;
    } else {
      const locale = currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'uz' ? 'uz-UZ' : currentLanguage === 'en' ? 'en-US' : 'ru-RU';
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }
  };

  const getStats = () => {
    if (history.length === 0) return null;

    const totals = history.map(h => h.total);
    const average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const bestDay = Math.max(...totals);
    const bestDayEntry = history.find(h => h.total === bestDay);

    return {
      average,
      bestDay,
      bestDayDate: bestDayEntry ? formatDate(bestDayEntry.date) : '',
      totalDays: history.length,
    };
  };

  const goalProgress = Math.min((todayCount / dailyGoal) * 100, 100);
  const currentZikrType = zikrTypes.find(t => t.id === zikrType) || zikrTypes[0];
  const currentCount = counts[zikrType] || 0;
  const stats = getStats();
  const t = LANGUAGES[currentLanguage] || LANGUAGES.ru; // Переводы

  // Функции для новых возможностей
  const checkAchievements = useCallback((totalCount) => {
    const newAchievements = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (!achievements.includes(achievement.id)) {
        if (achievement.id === 'first_100' && totalCount >= 100) {
          newAchievements.push(achievement.id);
        } else if (achievement.id === 'first_1000' && totalCount >= 1000) {
          newAchievements.push(achievement.id);
        } else if (achievement.id === 'first_10000' && totalCount >= 10000) {
          newAchievements.push(achievement.id);
        } else if (achievement.id === 'week_streak' && streakDays >= 7) {
          newAchievements.push(achievement.id);
        } else if (achievement.id === 'month_streak' && streakDays >= 30) {
          newAchievements.push(achievement.id);
        } else if (achievement.id === 'goal_achiever' && goalAchievedCount >= 10) {
          newAchievements.push(achievement.id);
        }
      }
    });
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      newAchievements.forEach(achId => {
        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (ach) {
          Alert.alert('🎉 ' + t.achievements + '!', `${ach.icon} ${ach.name}\n${ach.description}`);
        }
      });
    }
  }, [achievements, streakDays, goalAchievedCount]);

  // Таймер сессии
  useEffect(() => {
    if (currentCount > 0 && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    if (currentCount === 0 && sessionStartTime) {
      setSessionStartTime(null);
      setSessionDuration(0);
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }
    if (sessionStartTime && currentCount > 0) {
      sessionTimerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - sessionStartTime) / 1000);
        setSessionDuration(diff);
      }, 1000);
    }
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionStartTime, currentCount]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionSpeed = () => {
    if (sessionDuration === 0 || currentCount === 0) return 0;
    return Math.round((currentCount / sessionDuration) * 60);
  };

  // Расширенная статистика
  const getExtendedStats = () => {
    const allTimeTotal = history.reduce((sum, h) => sum + h.total, 0) + todayCount;
    const byTimeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const byType = {};
    
    zikrTypes.forEach(type => {
      const typeTotal = history.reduce((sum, h) => sum + (h.counts?.[type.id] || 0), 0) + (todayCounts[type.id] || 0);
      byType[type.id] = typeTotal;
    });

    return {
      allTimeTotal,
      byTimeOfDay,
      byType,
      averageSpeed: stats ? stats.average : 0,
    };
  };

  // График данных
  const getChartData = () => {
    const now = new Date();
    const days = chartPeriod === 'week' ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const entry = history.find(h => h.date === dateStr);
      data.push({
        date: dateStr,
        value: entry ? entry.total : 0,
        label: i === 0 ? t.today : i === 1 ? t.yesterday : date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'uz' ? 'uz-UZ' : currentLanguage === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short' }),
      });
    }
    
    return data;
  };

  // Экспорт данных
  const exportData = async () => {
    try {
      const data = {
        zikrTypes,
        history,
        counts,
        todayCount,
        todayCounts,
        dailyGoal,
        achievements,
        totalAllTime,
        goalAchievedCount,
        streakDays,
        exportDate: new Date().toISOString(),
      };
      const json = JSON.stringify(data, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `misbaha_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert(t.success, t.exportSuccess);
      } else {
        // Для мобильных можно использовать expo-file-system или поделиться
        Alert.alert(t.export, `Данные:\n${json.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      Alert.alert(t.error, t.exportError);
    }
  };

  // Импорт данных
  const importData = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.zikrTypes) setZikrTypes(data.zikrTypes);
      if (data.history) setHistory(data.history);
      if (data.counts) setCounts(data.counts);
      if (data.todayCount !== undefined) setTodayCount(data.todayCount);
      if (data.todayCounts) setTodayCounts(data.todayCounts);
      if (data.dailyGoal) setDailyGoal(data.dailyGoal);
      if (data.achievements) setAchievements(data.achievements);
      if (data.totalAllTime) setTotalAllTime(data.totalAllTime);
      if (data.goalAchievedCount) setGoalAchievedCount(data.goalAchievedCount);
      if (data.streakDays) setStreakDays(data.streakDays);
      Alert.alert(t.success, t.importSuccess);
    } catch (error) {
      console.error('Ошибка импорта:', error);
      Alert.alert(t.error, t.importErrorFormat);
    }
  };

  // Обновление достижений при изменении счетчиков
  useEffect(() => {
    if (isDataLoadedRef.current) {
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      checkAchievements(total);
      setTotalAllTime(total);
    }
  }, [counts, checkAchievements]);

  // Обновление серии дней
  useEffect(() => {
    if (history.length > 0) {
      let streak = 0;
      const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = new Date().toDateString();
      
      for (let i = 0; i < sortedHistory.length; i++) {
        const entryDate = new Date(sortedHistory[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (entryDate.toDateString() === expectedDate.toDateString() && sortedHistory[i].total > 0) {
          streak++;
        } else {
          break;
        }
      }
      setStreakDays(streak);
    }
  }, [history, todayCount]);

  // Функции для уведомлений
  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      // Для веба используем Web Notifications API
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } else {
      // Для мобильных устройств
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    }
  };

  const scheduleNotifications = async () => {
    if (!notificationsEnabled) {
      // Отменяем все уведомления
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert(t.permission, t.notificationPermissionApp);
      setNotificationsEnabled(false);
      return;
    }

    if (Platform.OS === 'web') {
      // Для веба используем Web Notifications API (только для текущей сессии)
      // Постоянные уведомления на вебе требуют Service Worker
      return;
    }

    // Отменяем старые уведомления
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Создаем ежедневное уведомление в указанное время
    const [hours, minutes] = notificationTime.split(':').map(Number);
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Время для зикра',
        body: 'Не забудьте совершить зикр сегодня!',
        sound: true,
      },
      trigger,
    });

    // Создаем периодические уведомления (каждые N часов)
    if (notificationInterval > 0) {
      const intervalTrigger = {
        seconds: notificationInterval * 3600,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📿 Напоминание о зикре',
          body: 'Время для зикра!',
          sound: true,
        },
        trigger: intervalTrigger,
      });
    }
  };

  // Обновление уведомлений при изменении настроек
  useEffect(() => {
    if (isDataLoadedRef.current) {
      scheduleNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsEnabled, notificationTime, notificationInterval]);

  const saveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (newGoal > 0 && newGoal <= 10000) {
      setDailyGoal(newGoal);
      setShowGoalInput(false);
      setGoalInput('');
    } else {
      Alert.alert(t.error, t.goalError);
    }
  };

  const renderCounterScreen = () => (
    <View style={styles.counterScreen}>
      {/* Заголовок */}
      <View style={styles.counterHeader}>
        <Text style={styles.counterTitle}>
          {telegramUser && isTelegram() 
            ? `${t.counter}${telegramUser.first_name ? `, ${telegramUser.first_name}` : ''}`
            : t.counter}
        </Text>
      </View>

      {/* Выбор зикра - минималистичный */}
      <TouchableOpacity
        style={styles.zikrSelector}
        onPress={() => setShowZikrSelector(true)}
      >
        <View style={styles.zikrSelectorContent}>
          <Text style={styles.zikrSelectorArabic}>{currentZikrType.arabic}</Text>
          <Text style={styles.zikrSelectorName}>{currentZikrType.name}</Text>
          <Text style={styles.zikrSelectorHint}>{t.selectZikr}</Text>
        </View>
      </TouchableOpacity>

      {/* Основной счетчик */}
      <Animated.View style={[styles.mainCounter, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.counterValue}>{currentCount}</Text>
        <Text style={styles.counterLabel}>{t.currentSession}</Text>
        {sessionDuration > 0 && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTime}>{formatTime(sessionDuration)}</Text>
            {getSessionSpeed() > 0 && (
              <Text style={styles.sessionSpeed}>{getSessionSpeed()} {t.perMinute}</Text>
            )}
          </View>
        )}
      </Animated.View>

      {/* Статистика за сегодня */}
      <View style={styles.todayStats}>
        <Text style={styles.todayValue}>{todayCount}</Text>
        <Text style={styles.todayLabel}>{t.today}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{todayCount} / {dailyGoal}</Text>
      </View>

      {/* Кнопки управления */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.decrementButton, currentCount === 0 && styles.buttonDisabled]}
          onPress={decrementCount}
          disabled={currentCount === 0}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.incrementButton]}
          onPress={incrementCount}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Кнопки действий */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={resetSession}>
          <Text style={styles.actionButtonText}>{t.resetSession}</Text>
        </TouchableOpacity>
      </View>

      {/* Модальное окно выбора зикра */}
      <Modal
        visible={showZikrSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZikrSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectZikrTitle}</Text>
              <TouchableOpacity onPress={() => setShowZikrSelector(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {zikrTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.zikrOption,
                    zikrType === type.id && styles.zikrOptionActive,
                  ]}
                  onPress={() => {
                    setZikrType(type.id);
                    setShowZikrSelector(false);
                  }}
                >
                  <View style={styles.zikrOptionContent}>
                    <Text style={styles.zikrOptionArabic}>{type.arabic}</Text>
                    <Text style={styles.zikrOptionName}>{type.name}</Text>
                    {type.custom && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteCustomZikr(type.id)}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.zikrOptionCount}>{counts[type.id] || 0}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addZikrInModal}
                onPress={() => {
                  setShowZikrSelector(false);
                  setShowAddZikr(true);
                }}
              >
                <Text style={styles.addZikrInModalText}>{t.addNewZikr}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно добавления зикра */}
      <Modal
        visible={showAddZikr}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddZikr(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS_THEME.lightText }]}>{t.addZikr}</Text>
              <TouchableOpacity onPress={() => setShowAddZikr(false)}>
                <Text style={[styles.modalClose, { color: COLORS_THEME.darkText }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.addZikrForm} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: COLORS_THEME.lightText }]}>{t.zikrName}</Text>
                <Text style={[styles.formHint, { color: COLORS_THEME.darkText }]}>{t.zikrNameHint}</Text>
                <TextInput
                  style={[styles.formInput, { borderColor: COLORS_THEME.darkTeal, color: COLORS_THEME.lightText }]}
                  value={newZikrName}
                  onChangeText={handleZikrNameChange}
                  placeholder="Например: СубханАллах"
                  placeholderTextColor={COLORS_THEME.darkText}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: COLORS_THEME.lightText }]}>{t.arabicText}</Text>
                <Text style={[styles.formHint, { color: COLORS_THEME.darkText }]}>{t.arabicTextHint}</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputArabic, { borderColor: COLORS_THEME.darkTeal, color: COLORS_THEME.lightText }]}
                  value={newZikrArabic}
                  onChangeText={setNewZikrArabic}
                  placeholder="سُبْحَانَ اللَّهِ"
                  placeholderTextColor={COLORS_THEME.darkText}
                  textAlign="right"
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.formButtonCancel, { borderColor: COLORS_THEME.darkTeal }]} 
                  onPress={() => {
                    setShowAddZikr(false);
                    setNewZikrName('');
                    setNewZikrArabic('');
                  }}
                >
                  <Text style={[styles.formButtonCancelText, { color: COLORS_THEME.lightText }]}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.formButton, styles.formButtonAdd, { backgroundColor: COLORS_THEME.orange }, !newZikrName.trim() && styles.formButtonDisabled]} 
                  onPress={addCustomZikr}
                  disabled={!newZikrName.trim()}
                >
                  <Text style={[styles.formButtonAddText, { color: COLORS_THEME.veryDarkGreen }]}>{t.add}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );

  const renderHistoryScreen = () => (
    <View style={styles.historyScreen}>
      <ScrollView style={styles.historyContent} contentContainerStyle={styles.historyScrollContent}>
        <Text style={styles.screenTitle}>{t.history}</Text>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.historyEmpty}</Text>
          <Text style={styles.emptySubtext}>{t.historyEmptyDesc}</Text>
        </View>
      ) : (
        history.slice().reverse().map((entry, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.historyTotal}>{entry.total} {t.zikr}</Text>
          </View>
        ))
      )}
      </ScrollView>
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.settingsScreen}>
      <ScrollView style={styles.settingsContent} contentContainerStyle={styles.settingsScrollContent}>
        <Text style={styles.screenTitle}>{t.settings}</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.notifications}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Text style={styles.settingItemTitle}>{t.vibration}</Text>
            <Text style={styles.settingItemDescription}>{t.vibrationDesc}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, vibrationEnabled && styles.toggleActive]}
            onPress={() => setVibrationEnabled(!vibrationEnabled)}
          >
            <View style={[styles.toggleThumb, vibrationEnabled && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
        
        {/* Тест вибрации - только в Telegram и если вибрация включена */}
        {isTelegram() && vibrationEnabled && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal, marginTop: 8 }]}
            onPress={() => {
              vibrate(50);
              Alert.alert('📳', 'Вибрация отправлена! Если не почувствовали, проверьте настройки устройства.');
            }}
          >
            <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>📳 Тест вибрации</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.settingItem, { borderColor: COLORS_THEME.darkTeal }]}>
          <View style={styles.settingItemLeft}>
            <Text style={[styles.settingItemTitle, { color: COLORS_THEME.lightText }]}>{t.reminders}</Text>
            <Text style={[styles.settingItemDescription, { color: COLORS_THEME.darkText }]}>{t.remindersDesc}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, { borderColor: COLORS_THEME.darkTeal }, notificationsEnabled && styles.toggleActive, notificationsEnabled && { backgroundColor: COLORS_THEME.darkTeal }]}
            onPress={async () => {
              const newValue = !notificationsEnabled;
              setNotificationsEnabled(newValue);
              if (newValue) {
                const hasPermission = await requestNotificationPermissions();
                if (!hasPermission) {
                  setNotificationsEnabled(false);
                  Alert.alert(t.permission, t.notificationPermission);
                }
              }
            }}
          >
            <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbActive, notificationsEnabled && { backgroundColor: COLORS_THEME.orange }]} />
          </TouchableOpacity>
        </View>

        {notificationsEnabled && (
          <>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingItemTitle}>{t.dailyReminderTime}</Text>
                <Text style={styles.settingItemDescription}>{t.dailyReminderTimeDesc}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowNotificationTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>{notificationTime}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingItemTitle}>{t.reminderInterval}</Text>
                <Text style={styles.settingItemDescription}>{t.reminderIntervalDesc}</Text>
              </View>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => setShowNotificationIntervalPicker(true)}
              >
                <Text style={styles.intervalButtonText}>{notificationInterval} ч</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.goals}</Text>
        
        <View style={[styles.settingItem, { borderColor: COLORS_THEME.darkTeal }]}>
          <View style={styles.settingItemLeft}>
            <Text style={[styles.settingItemTitle, { color: COLORS_THEME.lightText }]}>{t.dailyGoal}</Text>
            <Text style={[styles.settingItemDescription, { color: COLORS_THEME.darkText }]}>{t.dailyGoalDesc}</Text>
          </View>
          {showGoalInput ? (
            <View style={styles.goalInputWrapper}>
              <TextInput
                style={styles.goalInput}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                placeholder={dailyGoal.toString()}
                placeholderTextColor={COLORS.darkText}
                autoFocus={true}
              />
              <TouchableOpacity style={styles.goalSaveButton} onPress={saveGoal}>
                <Text style={styles.goalSaveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.goalCancelButton} 
                onPress={() => {
                  setShowGoalInput(false);
                  setGoalInput('');
                }}
              >
                <Text style={styles.goalCancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.goalDisplayButton}
              onPress={() => {
                setGoalInput(dailyGoal.toString());
                setShowGoalInput(true);
              }}
            >
              <Text style={styles.goalDisplayText}>{dailyGoal}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.sounds}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Text style={styles.settingItemTitle}>{t.sounds}</Text>
            <Text style={styles.settingItemDescription}>{t.soundsDesc}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, soundsEnabled && styles.toggleActive]}
            onPress={() => setSoundsEnabled(!soundsEnabled)}
          >
            <View style={[styles.toggleThumb, soundsEnabled && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.theme}</Text>
        
        {Object.keys(THEMES).map(themeKey => (
          <TouchableOpacity
            key={themeKey}
            style={[styles.themeOption, currentTheme === themeKey && styles.themeOptionActive]}
            onPress={() => setCurrentTheme(themeKey)}
          >
            <Text style={[styles.themeOptionText, currentTheme === themeKey && styles.themeOptionTextActive]}>
              {THEMES[themeKey].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.language}</Text>
        
        {Object.keys(LANGUAGES).map(langKey => (
          <TouchableOpacity
            key={langKey}
            style={[
              styles.languageOption,
              { borderColor: COLORS_THEME.darkTeal },
              currentLanguage === langKey && styles.languageOptionActive,
              currentLanguage === langKey && { backgroundColor: COLORS_THEME.darkTeal, borderColor: COLORS_THEME.orange }
            ]}
            onPress={() => setCurrentLanguage(langKey)}
          >
            <Text style={[
              styles.languageOptionText,
              { color: COLORS_THEME.lightText },
              currentLanguage === langKey && styles.languageOptionTextActive,
              currentLanguage === langKey && { color: COLORS_THEME.orange }
            ]}>
              {LANGUAGES[langKey].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.achievements}</Text>
        
        <TouchableOpacity style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal }]} onPress={() => setShowAchievements(true)}>
          <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>{t.viewAchievements}</Text>
        </TouchableOpacity>
      </View>

      {/* Telegram функции - только если запущено в Telegram */}
      {isTelegram() && (
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: COLORS_THEME.lightText }]}>Telegram</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal, backgroundColor: COLORS_THEME.darkTeal }]} 
            onPress={() => {
              sendStatsToBot();
              Alert.alert(t.success, 'Статистика отправлена в бот! Используйте команду /stats в боте для просмотра.');
            }}
          >
            <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>📊 Отправить статистику в бот</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal }]} 
            onPress={() => {
              syncDataWithBot();
              // Показываем MainButton для подтверждения отправки
              if (isTelegram() && telegramWebAppRef.current?.MainButton) {
                const mainButton = telegramWebAppRef.current.MainButton;
                mainButton.setText('📤 Отправка данных...');
                mainButton.show();
                mainButton.onClick(() => {
                  syncDataWithBot();
                  mainButton.hide();
                  Alert.alert(t.success, 'Данные синхронизированы с ботом!');
                });
                // Автоматически скрываем через 3 секунды
                setTimeout(() => {
                  mainButton.hide();
                }, 3000);
              } else {
                Alert.alert(t.success, 'Данные синхронизированы с ботом!');
              }
            }}
          >
            <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>🔄 Синхронизировать данные</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={[styles.settingsSectionTitle, { color: COLORS_THEME.lightText }]}>{t.export}</Text>
        
        <TouchableOpacity style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal }]} onPress={exportData}>
          <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>{t.export}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { borderColor: COLORS_THEME.darkTeal }]} onPress={() => setShowImportModal(true)}>
          <Text style={[styles.actionButtonText, { color: COLORS_THEME.lightText }]}>{t.import}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>{t.data}</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={resetAll}>
          <Text style={styles.dangerButtonText}>{t.resetAll}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );

  const renderStatsScreen = () => {
    const extendedStats = getExtendedStats();
    const chartData = getChartData();
    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    
    return (
      <View style={styles.statsScreen}>
        <ScrollView style={styles.statsContent} contentContainerStyle={styles.statsScrollContent}>
          <Text style={[styles.screenTitle, { color: COLORS_THEME.lightText }]}>{t.stats}</Text>
          {!stats ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: COLORS_THEME.darkText }]}>{t.notEnoughData}</Text>
              <Text style={[styles.emptySubtext, { color: COLORS_THEME.darkText }]}>{t.needMinHistory}</Text>
            </View>
          ) : (
            <>
              {/* Основная статистика */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.average}</Text>
                  <Text style={styles.statLabel}>{t.averagePerDay}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.bestDay}</Text>
                  <Text style={styles.statLabel}>{t.bestDay}</Text>
                  <Text style={styles.statSubtext}>{stats.bestDayDate}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalDays}</Text>
                  <Text style={styles.statLabel}>{t.totalDays}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{extendedStats.allTimeTotal}</Text>
                  <Text style={styles.statLabel}>{t.totalAllTime}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{streakDays}</Text>
                  <Text style={styles.statLabel}>{t.daysStreak}</Text>
                </View>
              </View>

              {/* График */}
              <View style={styles.chartSection}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>{t.charts}</Text>
                  <View style={styles.chartPeriodSelector}>
                    <TouchableOpacity
                      style={[styles.chartPeriodButton, chartPeriod === 'week' && styles.chartPeriodButtonActive]}
                      onPress={() => setChartPeriod('week')}
                    >
                      <Text style={[styles.chartPeriodText, chartPeriod === 'week' && styles.chartPeriodTextActive]}>
                        {t.week}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chartPeriodButton, chartPeriod === 'month' && styles.chartPeriodButtonActive]}
                      onPress={() => setChartPeriod('month')}
                    >
                      <Text style={[styles.chartPeriodText, chartPeriod === 'month' && styles.chartPeriodTextActive]}>
                        {t.month}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.chartContainer}>
                  <Svg height={200} width={SCREEN_WIDTH - 48}>
                    {chartData.map((item, index) => {
                      const x = (index * (SCREEN_WIDTH - 48)) / (chartData.length - 1 || 1);
                      const barHeight = maxValue > 0 ? (item.value / maxValue) * 180 : 0;
                      const y = 200 - barHeight;
                      return (
                        <Rect
                          key={index}
                          x={x - 8}
                          y={y}
                          width={16}
                          height={barHeight}
                          fill={COLORS_THEME.orange}
                          opacity={0.8}
                        />
                      );
                    })}
                  </Svg>
                  <View style={styles.chartLabels}>
                    {chartData.map((item, index) => (
                      <Text key={index} style={[styles.chartLabel, { color: COLORS_THEME.darkText }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* Статистика по типам */}
              <View style={styles.byTypeSection}>
                <Text style={styles.sectionTitle}>{t.byType}</Text>
                {zikrTypes.map(type => (
                  <View key={type.id} style={styles.typeStatItem}>
                    <Text style={styles.typeStatName}>{type.name}</Text>
                    <Text style={styles.typeStatValue}>{extendedStats.byType[type.id] || 0}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderSplashScreen = () => (
    <View style={styles.splashScreen}>
      <StatusBar style="dark" backgroundColor="#004734" translucent={false} />
      <View style={styles.appBackgroundContainer}>
        <Image 
          source={require('./assets/bg.png')} 
          style={styles.appBackgroundImage}
          resizeMode="cover"
        />
      </View>
      <Animated.View 
        style={[
          styles.splashContent,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.splashArabic}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
      </Animated.View>
    </View>
  );

  if (isLoading) {
    return renderSplashScreen();
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" backgroundColor="#004734" translucent={true} />
      
      {/* Общий фон для всего приложения */}
      <View style={styles.appBackgroundContainer}>
        <Image 
          source={require('./assets/bg.png')} 
          style={styles.appBackgroundImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.container}>
      {/* Навигация в стиле iOS 26 с эффектом жидкого стекла */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBarContainer}>
          <BlurView intensity={80} tint="dark" style={styles.tabBarBlur}>
            <View style={styles.tabBarContent}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentScreen('counter')}
                activeOpacity={0.7}
              >
                {currentScreen === 'counter' ? (
                  <View style={styles.activeTabPill}>
                    <Ionicons name="home" size={24} color="#1a1a2e" />
                    <Text style={styles.activeTabText}>Счетчик</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="home-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>Счетчик</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentScreen('history')}
                activeOpacity={0.7}
              >
                {currentScreen === 'history' ? (
                  <View style={styles.activeTabPill}>
                    <Ionicons name="book" size={24} color="#1a1a2e" />
                    <Text style={styles.activeTabText}>{t.history}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="book-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>{t.history}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentScreen('stats')}
                activeOpacity={0.7}
              >
                {currentScreen === 'stats' ? (
                  <View style={styles.activeTabPill}>
                    <Ionicons name="stats-chart" size={24} color="#1a1a2e" />
                    <Text style={styles.activeTabText} numberOfLines={1}>{t.stats}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="stats-chart-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>{t.stats}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentScreen('settings')}
                activeOpacity={0.7}
              >
                {currentScreen === 'settings' ? (
                  <View style={styles.activeTabPill}>
                    <Ionicons name="settings" size={24} color="#1a1a2e" />
                    <Text style={styles.activeTabText}>{t.settings}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="settings-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>{t.settings}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Контент */}
      {currentScreen === 'counter' && renderCounterScreen()}
      {currentScreen === 'history' && renderHistoryScreen()}
      {currentScreen === 'stats' && renderStatsScreen()}
      {currentScreen === 'settings' && renderSettingsScreen()}

      {/* Модальное окно достижений */}
      <Modal
        visible={showAchievements}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAchievements(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.achievements}</Text>
              <TouchableOpacity onPress={() => setShowAchievements(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = achievements.includes(achievement.id);
                return (
                  <View
                    key={achievement.id}
                    style={[styles.achievementItem, { borderColor: COLORS_THEME.darkTeal }, !isUnlocked && styles.achievementItemLocked]}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementContent}>
                      <Text style={[styles.achievementName, { color: COLORS_THEME.lightText }]}>{achievement.name}</Text>
                      <Text style={[styles.achievementDescription, { color: COLORS_THEME.darkText }]}>{achievement.description}</Text>
                    </View>
                    {isUnlocked && <Text style={[styles.achievementCheck, { color: COLORS_THEME.orange }]}>✓</Text>}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно выбора времени уведомления */}
      <Modal
        visible={showNotificationTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationTimePicker(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>{t.notificationTimeTitle}</Text>
            <Text style={styles.confirmModalText}>
              {t.notificationTimeDesc}
            </Text>
            <View style={styles.timePickerContainer}>
              <TextInput
                style={styles.timeInput}
                value={notificationTime}
                onChangeText={(text) => {
                  // Проверяем формат HH:MM
                  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                  const partialTimeRegex = /^([0-1]?[0-9]|2[0-3])$/;
                  if (timeRegex.test(text) || text === '' || partialTimeRegex.test(text)) {
                    setNotificationTime(text);
                  }
                }}
                placeholder="09:00"
                placeholderTextColor={COLORS.darkText}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel]}
                onPress={() => setShowNotificationTimePicker(false)}
              >
                <Text style={styles.confirmModalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonConfirm]}
                onPress={() => {
                  const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                  if (timeFormatRegex.test(notificationTime)) {
                    setShowNotificationTimePicker(false);
                  } else {
                    Alert.alert(t.error, t.timeFormatError);
                  }
                }}
              >
                <Text style={styles.confirmModalButtonConfirmText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно выбора интервала уведомлений */}
      <Modal
        visible={showNotificationIntervalPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationIntervalPicker(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={[styles.confirmModalTitle, { color: COLORS_THEME.lightText }]}>{t.reminderIntervalTitle}</Text>
            <Text style={[styles.confirmModalText, { color: COLORS_THEME.darkText }]}>
              {t.reminderIntervalDesc}
            </Text>
            <View style={styles.intervalPickerContainer}>
              {[0, 1, 2, 3, 4, 6, 8, 12].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.intervalOption,
                    { borderColor: COLORS_THEME.darkTeal },
                    notificationInterval === hours && styles.intervalOptionActive,
                    notificationInterval === hours && { backgroundColor: COLORS_THEME.darkTeal, borderColor: COLORS_THEME.orange },
                  ]}
                  onPress={() => {
                    setNotificationInterval(hours);
                    setShowNotificationIntervalPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.intervalOptionText,
                      { color: COLORS_THEME.lightText },
                      notificationInterval === hours && styles.intervalOptionTextActive,
                      notificationInterval === hours && { color: COLORS_THEME.orange },
                    ]}
                  >
                    {hours === 0 ? t.disabled : `${hours} ${t.hours}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel, { borderColor: COLORS_THEME.darkTeal }]}
                onPress={() => setShowNotificationIntervalPicker(false)}
              >
                <Text style={[styles.confirmModalButtonCancelText, { color: COLORS_THEME.lightText }]}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно импорта */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>{t.import}</Text>
            <Text style={styles.confirmModalText}>
              Вставьте JSON данные для импорта
            </Text>
            <TextInput
              style={styles.importInput}
              multiline
              value={importDataText}
              onChangeText={setImportDataText}
              placeholder={t.importPlaceholder}
              placeholderTextColor={COLORS.darkText}
            />
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.confirmModalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonConfirm]}
                onPress={() => {
                  if (importDataText.trim()) {
                    importData(importDataText);
                    setImportDataText('');
                    setShowImportModal(false);
                  } else {
                    Alert.alert(t.error, t.importError);
                  }
                }}
              >
                <Text style={styles.confirmModalButtonConfirmText}>{t.import}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно подтверждения сброса сессии */}
      <Modal
        visible={showResetSessionConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetSessionConfirm(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={[styles.confirmModalTitle, { color: COLORS_THEME.lightText }]}>{t.resetSessionTitle}</Text>
            <Text style={[styles.confirmModalText, { color: COLORS_THEME.darkText }]}>
              {t.resetSessionConfirm}
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel, { borderColor: COLORS_THEME.darkTeal }]}
                onPress={() => setShowResetSessionConfirm(false)}
              >
                <Text style={[styles.confirmModalButtonCancelText, { color: COLORS_THEME.lightText }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonConfirm, { backgroundColor: COLORS_THEME.darkTeal }]}
                onPress={confirmResetSession}
              >
                <Text style={[styles.confirmModalButtonConfirmText, { color: COLORS_THEME.lightText }]}>{t.reset}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно подтверждения сброса всех данных */}
      <Modal
        visible={showResetAllConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetAllConfirm(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={[styles.confirmModalTitle, { color: COLORS_THEME.lightText }]}>{t.resetAllTitle}</Text>
            <Text style={[styles.confirmModalText, { color: COLORS_THEME.darkText }]}>
              {t.resetAllConfirm}
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel, { borderColor: COLORS_THEME.darkTeal }]}
                onPress={() => setShowResetAllConfirm(false)}
              >
                <Text style={[styles.confirmModalButtonCancelText, { color: COLORS_THEME.lightText }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonDanger]}
                onPress={confirmResetAll}
              >
                <Text style={styles.confirmModalButtonDangerText}>{t.reset}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно второго подтверждения сброса всех данных */}
      <Modal
        visible={showResetAllConfirm2}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetAllConfirm2(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={[styles.confirmModalTitle, { color: COLORS_THEME.lightText }]}>{t.confirmation}</Text>
            <Text style={[styles.confirmModalText, { color: COLORS_THEME.darkText }]}>
              {t.resetAllConfirm2}
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel, { borderColor: COLORS_THEME.darkTeal }]}
                onPress={() => setShowResetAllConfirm2(false)}
              >
                <Text style={[styles.confirmModalButtonCancelText, { color: COLORS_THEME.lightText }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonDanger]}
                onPress={confirmResetAll2}
              >
                <Text style={styles.confirmModalButtonDangerText}>{t.reset}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.veryDarkGreen,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: Platform.OS === 'web' ? 0 : (isIPhone16Pro ? 110 : 100),
  },
  navigation: {
    height: 0,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabBarContainer: {
    paddingBottom: Platform.OS === 'web' ? 0 : (isIPhone16Pro ? 20 : 10),
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 0 : 10,
  },
  tabBarBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 68,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeTabPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 90,
    marginTop: -6,
    marginBottom: -6,
  },
  inactiveTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  activeTabText: {
    color: '#1a1a2e',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '500',
  },
  counterScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 16, // 16 + 25 + 29 = 70 для iOS
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  appBackgroundContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.15,
    left: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
    bottom: -SCREEN_HEIGHT * 0.15,
    zIndex: 0,
  },
  appBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.75 }],
  },
  navigation: {
    height: 0,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabBarContainer: {
    paddingBottom: Platform.OS === 'web' ? 0 : (isIPhone16Pro ? 20 : 10),
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 0 : 10,
  },
  counterHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
    zIndex: 1,
  },
  counterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.orange,
    textAlign: 'center',
  },
  zikrSelector: {
    width: '100%',
    backgroundColor: '#052a24',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    zIndex: 1,
    opacity: 0.75,
  },
  zikrSelectorContent: {
    alignItems: 'center',
  },
  zikrSelectorArabic: {
    fontSize: 32,
    color: COLORS.darkTeal,
    marginBottom: 8,
    textAlign: 'center',
  },
  zikrSelectorName: {
    fontSize: 18,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 4,
  },
  zikrSelectorHint: {
    fontSize: 12,
    color: COLORS.darkText,
  },
  mainCounter: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
    opacity: 0.75,
  },
  counterValue: {
    fontSize: 80,
    color: COLORS.orange,
    fontWeight: '700',
    marginBottom: 8,
  },
  counterLabel: {
    fontSize: 16,
    color: COLORS.darkText,
  },
  sessionInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 14,
    color: COLORS.darkTeal,
    fontWeight: '600',
  },
  sessionSpeed: {
    fontSize: 12,
    color: COLORS.darkText,
    marginTop: 4,
  },
  todayStats: {
    width: '100%',
    backgroundColor: '#052a24',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.75,
  },
  todayValue: {
    fontSize: 40,
    color: COLORS.darkTeal,
    fontWeight: '700',
    marginBottom: 6,
  },
  todayLabel: {
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#052a24',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.darkText,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    zIndex: 1,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkTeal,
  },
  incrementButton: {
    backgroundColor: COLORS.orange,
  },
  decrementButton: {
    backgroundColor: '#052a24',
    borderWidth: 2,
    borderColor: COLORS.darkTeal,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 36,
    color: COLORS.lightText,
    fontWeight: '700',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    zIndex: 1,
  },
  actionButton: {
    backgroundColor: '#052a24',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  actionButtonText: {
    color: COLORS.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 71, 52, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkTeal,
  },
  modalTitle: {
    fontSize: 20,
    color: COLORS.lightText,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.darkText,
  },
  modalScroll: {
    maxHeight: 400,
  },
  zikrOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#052a24',
  },
  zikrOptionActive: {
    backgroundColor: '#052a24',
  },
  zikrOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zikrOptionArabic: {
    fontSize: 24,
    color: COLORS.darkTeal,
    marginRight: 12,
  },
  zikrOptionName: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: COLORS.lightText,
    fontSize: 18,
    fontWeight: '700',
  },
  zikrOptionCount: {
    fontSize: 18,
    color: COLORS.orange,
    fontWeight: '700',
    marginLeft: 12,
  },
  addZikrInModal: {
    backgroundColor: '#052a24',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.darkTeal,
    borderStyle: 'dashed',
  },
  addZikrInModalText: {
    color: COLORS.darkTeal,
    fontSize: 16,
    fontWeight: '600',
  },
  addZikrForm: {
    padding: 24,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 6,
  },
  formHint: {
    fontSize: 12,
    color: COLORS.darkText,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#052a24',
    borderRadius: 12,
    padding: 16,
    color: COLORS.lightText,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  formInputArabic: {
    fontSize: 20,
    textAlign: 'right',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formButtonCancel: {
    backgroundColor: '#052a24',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  formButtonCancelText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  formButtonAdd: {
    backgroundColor: COLORS.orange,
  },
  formButtonDisabled: {
    opacity: 0.5,
  },
  formButtonAddText: {
    color: COLORS.veryDarkGreen,
    fontSize: 16,
    fontWeight: '700',
  },
  historyScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  historyContent: {
    flex: 1,
    zIndex: 1,
  },
  historyScrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 75 : 24, // 24 + 25 + 26 = 75 для iOS
  },
  screenTitle: {
    fontSize: 28,
    color: COLORS.lightText,
    fontWeight: '700',
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkText,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  historyDate: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  historyTotal: {
    fontSize: 18,
    color: COLORS.orange,
    fontWeight: '700',
  },
  statsScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  statsContent: {
    flex: 1,
    zIndex: 1,
  },
  statsScrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 75 : 24, // 24 + 25 + 26 = 75 для iOS
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  statValue: {
    fontSize: 48,
    color: COLORS.orange,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.darkText,
  },
  statSubtext: {
    fontSize: 14,
    color: COLORS.darkText,
    marginTop: 4,
  },
  settingsScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  settingsContent: {
    flex: 1,
    zIndex: 1,
  },
  settingsScrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 75 : 24, // 24 + 25 + 26 = 75 для iOS
    paddingBottom: Platform.OS === 'web' ? 20 : 100,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 18,
    color: COLORS.lightText,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  settingItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 12,
    color: COLORS.darkText,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#052a24',
    borderWidth: 2,
    borderColor: COLORS.darkTeal,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.darkTeal,
    borderColor: COLORS.darkTeal,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.darkText,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.orange,
    marginLeft: 'auto',
  },
  goalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInput: {
    backgroundColor: '#052a24',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    width: 80,
    textAlign: 'center',
    opacity: 1,
  },
  goalDisplayButton: {
    backgroundColor: COLORS.darkTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 1,
  },
  goalDisplayText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '700',
    opacity: 1,
  },
  goalSaveButton: {
    backgroundColor: COLORS.orange,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  goalSaveButtonText: {
    color: COLORS.veryDarkGreen,
    fontSize: 20,
    fontWeight: '700',
    opacity: 1,
  },
  goalCancelButton: {
    backgroundColor: '#052a24',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    opacity: 1,
  },
  goalInput: {
    backgroundColor: '#052a24',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    width: 80,
    textAlign: 'center',
  },
  goalDisplayButton: {
    backgroundColor: COLORS.darkTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goalDisplayText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '700',
  },
  goalSaveButton: {
    backgroundColor: COLORS.orange,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalSaveButtonText: {
    color: COLORS.veryDarkGreen,
    fontSize: 20,
    fontWeight: '700',
  },
  goalCancelButton: {
    backgroundColor: '#052a24',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  goalCancelButtonText: {
    color: COLORS.darkText,
    fontSize: 18,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#7a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9a2a2a',
  },
  dangerButtonText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#052a24',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.lightText,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmModalText: {
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmModalButtonCancel: {
    backgroundColor: '#052a24',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  confirmModalButtonConfirm: {
    backgroundColor: COLORS.darkTeal,
  },
  confirmModalButtonDanger: {
    backgroundColor: '#7a1a1a',
  },
  confirmModalButtonCancelText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButtonConfirmText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButtonDangerText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  splashScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  splashContent: {
    alignItems: 'center',
    padding: 40,
    zIndex: 10,
  },
  splashArabic: {
    fontSize: 48,
    color: COLORS.orange,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 72,
  },
  chartSection: {
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    color: COLORS.lightText,
    fontWeight: '700',
  },
  chartPeriodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  chartPeriodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#052a24',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  chartPeriodButtonActive: {
    backgroundColor: COLORS.darkTeal,
  },
  chartPeriodText: {
    fontSize: 12,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  chartPeriodTextActive: {
    color: COLORS.lightText,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.darkText,
    flex: 1,
    textAlign: 'center',
  },
  byTypeSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.lightText,
    fontWeight: '700',
    marginBottom: 12,
  },
  typeStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  typeStatName: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  typeStatValue: {
    fontSize: 18,
    color: COLORS.orange,
    fontWeight: '700',
  },
  themeOption: {
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  themeOptionActive: {
    backgroundColor: COLORS.darkTeal,
    borderColor: COLORS.orange,
  },
  themeOptionText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  themeOptionTextActive: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  languageOption: {
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  languageOptionActive: {
    backgroundColor: COLORS.darkTeal,
    borderColor: COLORS.orange,
  },
  languageOptionText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 42, 36, 0.75)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
  },
  achievementItemLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.darkText,
  },
  achievementCheck: {
    fontSize: 24,
    color: COLORS.orange,
    fontWeight: '700',
  },
  importInput: {
    backgroundColor: '#052a24',
    borderRadius: 12,
    padding: 12,
    color: COLORS.lightText,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  timeButton: {
    backgroundColor: COLORS.darkTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeButtonText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '700',
  },
  intervalButton: {
    backgroundColor: COLORS.darkTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  intervalButtonText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: '700',
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  timeInput: {
    backgroundColor: '#052a24',
    borderRadius: 12,
    padding: 16,
    color: COLORS.lightText,
    fontSize: 24,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    textAlign: 'center',
  },
  intervalPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  intervalOption: {
    backgroundColor: '#052a24',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.darkTeal,
    minWidth: 80,
    alignItems: 'center',
  },
  intervalOptionActive: {
    backgroundColor: COLORS.darkTeal,
    borderColor: COLORS.orange,
  },
  intervalOptionText: {
    fontSize: 14,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  intervalOptionTextActive: {
    color: COLORS.orange,
    fontWeight: '700',
  },
});
