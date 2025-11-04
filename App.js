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
  const isDataLoadedRef = React.useRef(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const lastDateRef = React.useRef('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const audioSoundRef = React.useRef(null);

  // Загрузка сохраненных данных при запуске
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Загружаем данные
      await loadData();
      
      // Воспроизводим звук Бисмиллах
      await playBismillah();
      
      // Небольшая задержка для показа экрана загрузки
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      setIsLoading(false);
    }
  };

  const playBismillah = async () => {
    try {
      // Запрашиваем разрешение на воспроизведение аудио
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
        // Если аудио файл не найден, просто продолжаем без звука
        console.log('Аудио файл не найден, продолжаем без звука:', audioError);
      }
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCount, dailyGoal, vibrationEnabled, counts, todayCounts, zikrTypes]);

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
    if (Platform.OS === 'web') {
      // Web Vibration API
      if ('vibrate' in navigator) {
        if (typeof pattern === 'number') {
          navigator.vibrate(pattern);
        } else if (Array.isArray(pattern)) {
          navigator.vibrate(pattern);
        }
      }
    } else {
      // React Native Vibration
      if (typeof pattern === 'number') {
        Vibration.vibrate(pattern);
      } else if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      }
    }
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
    
    if (vibrationEnabled) {
      vibrate(50);
      if (newCount % 33 === 0) {
        vibrate([100, 50, 100]);
      }
    }

    if (newTotal === dailyGoal) {
      Alert.alert('🎉 Поздравляем!', `Вы достигли цели на сегодня: ${dailyGoal} зикр!`);
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
      Alert.alert('Ошибка', 'Введите название зикра');
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
      'Удалить зикр',
      'Вы уверены, что хотите удалить этот вид зикра?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
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
    Alert.alert(
      'Сброс сессии',
      'Вы уверены, что хотите сбросить текущую сессию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
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
  };

  const resetAll = () => {
    Alert.alert(
      'Сброс всех данных',
      'Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить всё',
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
            } catch (error) {
              console.error('Ошибка очистки данных:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toDateString()) {
      return 'Сегодня';
    } else if (dateString === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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

  const saveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (newGoal > 0 && newGoal <= 10000) {
      setDailyGoal(newGoal);
      setShowGoalInput(false);
      setGoalInput('');
    } else {
      Alert.alert('Ошибка', 'Введите число от 1 до 10000');
    }
  };

  const renderCounterScreen = () => (
    <View style={styles.counterScreen}>
      {/* Заголовок */}
      <View style={styles.counterHeader}>
        <Text style={styles.counterTitle}>Счетчик Зикра</Text>
      </View>

      {/* Выбор зикра - минималистичный */}
      <TouchableOpacity
        style={styles.zikrSelector}
        onPress={() => setShowZikrSelector(true)}
      >
        <View style={styles.zikrSelectorContent}>
          <Text style={styles.zikrSelectorArabic}>{currentZikrType.arabic}</Text>
          <Text style={styles.zikrSelectorName}>{currentZikrType.name}</Text>
          <Text style={styles.zikrSelectorHint}>Нажмите для выбора</Text>
        </View>
      </TouchableOpacity>

      {/* Основной счетчик */}
      <Animated.View style={[styles.mainCounter, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.counterValue}>{currentCount}</Text>
        <Text style={styles.counterLabel}>Текущая сессия</Text>
      </Animated.View>

      {/* Статистика за сегодня */}
      <View style={styles.todayStats}>
        <Text style={styles.todayValue}>{todayCount}</Text>
        <Text style={styles.todayLabel}>Сегодня</Text>
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
          <Text style={styles.actionButtonText}>Сбросить сессию</Text>
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
              <Text style={styles.modalTitle}>Выберите зикр</Text>
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
                <Text style={styles.addZikrInModalText}>+ Добавить новый зикр</Text>
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
              <Text style={styles.modalTitle}>Добавить зикр</Text>
              <TouchableOpacity onPress={() => setShowAddZikr(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.addZikrForm} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Название зикра *</Text>
                <Text style={styles.formHint}>Введите название на латинице</Text>
                <TextInput
                  style={styles.formInput}
                  value={newZikrName}
                  onChangeText={handleZikrNameChange}
                  placeholder="Например: СубханАллах"
                  placeholderTextColor={COLORS.darkText}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Арабский текст</Text>
                <Text style={styles.formHint}>Опционально. Введите арабский текст</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputArabic]}
                  value={newZikrArabic}
                  onChangeText={setNewZikrArabic}
                  placeholder="سُبْحَانَ اللَّهِ"
                  placeholderTextColor={COLORS.darkText}
                  textAlign="right"
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.formButtonCancel]} 
                  onPress={() => {
                    setShowAddZikr(false);
                    setNewZikrName('');
                    setNewZikrArabic('');
                  }}
                >
                  <Text style={styles.formButtonCancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.formButton, styles.formButtonAdd, !newZikrName.trim() && styles.formButtonDisabled]} 
                  onPress={addCustomZikr}
                  disabled={!newZikrName.trim()}
                >
                  <Text style={styles.formButtonAddText}>Добавить</Text>
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
        <Text style={styles.screenTitle}>История</Text>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>История пуста</Text>
          <Text style={styles.emptySubtext}>Начните совершать зикр, чтобы увидеть статистику</Text>
        </View>
      ) : (
        history.slice().reverse().map((entry, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.historyTotal}>{entry.total} зикр</Text>
          </View>
        ))
      )}
      </ScrollView>
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.settingsScreen}>
      <ScrollView style={styles.settingsContent} contentContainerStyle={styles.settingsScrollContent}>
        <Text style={styles.screenTitle}>Настройки</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Уведомления</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Text style={styles.settingItemTitle}>Вибрация</Text>
            <Text style={styles.settingItemDescription}>Вибрация при каждом зикре</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, vibrationEnabled && styles.toggleActive]}
            onPress={() => setVibrationEnabled(!vibrationEnabled)}
          >
            <View style={[styles.toggleThumb, vibrationEnabled && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Цели</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Text style={styles.settingItemTitle}>Цель на день</Text>
            <Text style={styles.settingItemDescription}>Количество зикр для достижения цели</Text>
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
        <Text style={styles.settingsSectionTitle}>Данные</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={resetAll}>
          <Text style={styles.dangerButtonText}>Сбросить все данные</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );

  const renderStatsScreen = () => (
    <View style={styles.statsScreen}>
      <ScrollView style={styles.statsContent} contentContainerStyle={styles.statsScrollContent}>
        <Text style={styles.screenTitle}>Статистика</Text>
      {!stats ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Недостаточно данных</Text>
          <Text style={styles.emptySubtext}>Нужна минимум 1 запись в истории</Text>
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.average}</Text>
            <Text style={styles.statLabel}>Среднее в день</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bestDay}</Text>
            <Text style={styles.statLabel}>Лучший день</Text>
            <Text style={styles.statSubtext}>{stats.bestDayDate}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Всего дней</Text>
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );

  const renderSplashScreen = () => (
    <View style={styles.splashScreen}>
      <StatusBar style="light" />
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
      <StatusBar style="light" />
      
      {/* Общий фон для всего приложения */}
      <View style={styles.appBackgroundContainer}>
        <Image 
          source={require('./assets/bg.png')} 
          style={styles.appBackgroundImage}
          resizeMode="cover"
        />
      </View>
      
      <SafeAreaView style={styles.container}>
      
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
                    <Text style={styles.activeTabText}>История</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="book-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>История</Text>
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
                    <Text style={styles.activeTabText} numberOfLines={1}>Статистика</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="stats-chart-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>Статистика</Text>
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
                    <Text style={styles.activeTabText}>Настройки</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTabContainer}>
                    <Ionicons name="settings-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.inactiveTabText}>Настройки</Text>
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
      </SafeAreaView>
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
    paddingBottom: isIPhone16Pro ? 110 : 100,
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
    paddingBottom: isIPhone16Pro ? 20 : 10,
    paddingHorizontal: 12,
    paddingTop: 10,
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
    paddingTop: 16,
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
    paddingBottom: isIPhone16Pro ? 20 : 10,
    paddingHorizontal: 12,
    paddingTop: 10,
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
    paddingBottom: 100,
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
});
