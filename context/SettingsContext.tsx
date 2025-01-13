import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type SettingsContextType = {
  hapticEnabled: boolean;
  toggleHaptic: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hapticEnabled, setHapticEnabled] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      loadSettings();
    }
  }, []);

  const loadSettings = async () => {
    if (!isMobile) return;
    
    try {
      const savedHaptic = await AsyncStorage.getItem('hapticEnabled');
      if (savedHaptic !== null) {
        setHapticEnabled(JSON.parse(savedHaptic));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleHaptic = async () => {
    if (!isMobile) return;

    try {
      const newValue = !hapticEnabled;
      setHapticEnabled(newValue);
      await AsyncStorage.setItem('hapticEnabled', JSON.stringify(newValue));
      if (newValue) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          // Silently handle haptics errors
        }
      }
    } catch (error) {
      console.error('Error saving haptic setting:', error);
    }
  };

  const triggerHaptic = async (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!hapticEnabled || !isMobile) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      // Silently handle errors for platforms where Haptics is not available
      console.debug('Haptics not available on this platform');
    }
  };

  return (
    <SettingsContext.Provider value={{ hapticEnabled, toggleHaptic, triggerHaptic }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
