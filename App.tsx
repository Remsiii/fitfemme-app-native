
import React, { useState } from 'react';
import { View } from 'react-native';
import LanguageSwitcher from './components/LanguageSwitcher';
import i18n from './locales';

export default function App() {
  const [locale, setLocale] = useState(i18n.locale);

  const handleLanguageChange = (languageCode: string) => {
    setLocale(languageCode);
  };

  return (
    <View style={{ flex: 1 }}>
      <LanguageSwitcher onChangeLanguage={handleLanguageChange} />
      {/* Your app content here */}
    </View>
  );
}