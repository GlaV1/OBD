import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'tr' | 'en';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedLang = await AsyncStorage.getItem('@settings_language');
      if (storedLang === 'en' || storedLang === 'tr') {
        setLanguageState(storedLang);
      }
    } catch (e) {
      console.error('Ayarlar yüklenirken hata:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('@settings_language', lang);
      setLanguageState(lang);
    } catch (e) {
      console.error('Dil kaydedilirken hata:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
