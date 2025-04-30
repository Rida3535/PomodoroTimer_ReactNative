import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [workLen, setWorkLen] = useState('25');
  const [breakLen, setBreakLen] = useState('5');
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedCycles = await AsyncStorage.getItem('cycles');
      if (savedTheme) setTheme(savedTheme);
      if (savedCycles) setCycles(+savedCycles);
    })();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (isWork) {
              const newCycles = cycles + 1;
              setCycles(newCycles);
              AsyncStorage.setItem('cycles', newCycles.toString());
            }
            setIsWork(!isWork);
            Alert.alert(isWork ? 'Work session done! Time for a break.' : 'Break over! Back to work.');
            setSecondsLeft((isWork ? +breakLen : +workLen) * 60);
            setIsRunning(false);
            return (isWork ? +breakLen : +workLen) * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dusky' ? 'light' : 'dusky';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const startTimer = () => {
    if (!isRunning) setIsRunning(true);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft((isWork ? +workLen : +breakLen) * 60);
  };

  const updateTime = () => {
    if (!isRunning) setSecondsLeft((isWork ? +workLen : +breakLen) * 60);
  };

  const isDusky = theme === 'dusky';

  // Button colors based on theme
  const buttonColor = isDusky ? '#38bdf8' : '#16a34a';
  const buttonShadow = isDusky ? 'rgba(56,189,248,0.3)' : 'rgba(22,163,74,0.3)';
  const toggleBorderColor = isDusky ? '#38bdf8' : '#16a34a';

  return (
    <LinearGradient
      colors={isDusky ? ['#1e293b', '#334155'] : ['#fefce8', '#e0f2fe']}
      style={styles.container}
    >
      <StatusBar style="auto" />

      {/* Content Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.themeToggle, { borderColor: toggleBorderColor }]}
          onPress={toggleTheme}
        >
          <Text style={{ color: toggleBorderColor }}>
            {isDusky ? 'Light ☀️' : 'Dusky 🌙'}
          </Text>
        </TouchableOpacity>

        {/* Sun/Moon Wrapper */}
        <View style={styles.sunMoonWrapper}>
          <LinearGradient
            colors={isDusky ? ['#b0b0b0', '#d1d5db'] : ['#facc15', '#fde047']}
            style={styles.sunMoon}
          />
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: isDusky ? '#0f172a' : '#ffffff' }]}>
          <Text style={[styles.title, { color: isDusky ? '#f1f5f9' : '#0f172a' }]}>Pomodoro</Text>
          <Text style={[styles.timer, { color: buttonColor }]}>{fmt(secondsLeft)}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              disabled={isRunning}
              style={[
                styles.button,
                { backgroundColor: buttonColor, shadowColor: buttonShadow },
                isRunning && styles.disabled,
              ]}
              onPress={startTimer}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!isRunning}
              style={[
                styles.button,
                { backgroundColor: buttonColor, shadowColor: buttonShadow },
                !isRunning && styles.disabled,
              ]}
              onPress={resetTimer}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDusky ? '#f1f5f9' : '#0f172a' }]}>
              Work
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={workLen}
                onChangeText={(text) => {
                  setWorkLen(text);
                  updateTime();
                }}
              />{' '}
              min
            </Text>

            <Text style={[styles.label, { color: isDusky ? '#f1f5f9' : '#0f172a' }]}>
              Break
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={breakLen}
                onChangeText={(text) => {
                  setBreakLen(text);
                  updateTime();
                }}
              />{' '}
              min
            </Text>
          </View>

          <Text style={styles.smallText}>Completed pomodoros: {cycles}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 10,
    zIndex: 20,
  },
  sunMoonWrapper: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sunMoon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  card: {
    marginTop: 10,
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 24,
    width: '90%',
    maxWidth: 310,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 36,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 80,
    marginBottom: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#94a3b8',
    shadowColor: 'transparent',
  },
  formGroup: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    padding: 8,
    width: 48,
    textAlign: 'center',
    borderRadius: 8,
    marginLeft: 4,
  },
  smallText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 20,
  },
});
