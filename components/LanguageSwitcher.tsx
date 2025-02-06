
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '../locales';

interface LanguageSwitcherProps {
  onChangeLanguage: (languageCode: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onChangeLanguage }) => {
  const handleLanguageChange = (languageCode: string) => {
    i18n.locale = languageCode;
    onChangeLanguage(languageCode);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleLanguageChange('en')}>
        <Text style={styles.flag}>🇺🇸</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleLanguageChange('ro')}>
        <Text style={styles.flag}>🇷🇴</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  flag: {
    fontSize: 24,
    marginHorizontal: 5,
  },
});

export default LanguageSwitcher;