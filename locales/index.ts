
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

i18n.translations = {
  en: {
    greeting: 'Hello!',
    onboardingTitle1: 'Discover',
    onboardingSubtitle1: 'Join our community of strong and active women',
    // Add more English translations here
  },
  ro: {
    greeting: 'Salut!',
    onboardingTitle1: 'Descoperă',
    onboardingSubtitle1: 'Alătură-te comunității noastre de femei puternice și active',
    // Add more Romanian translations here
  },
};

i18n.locale = Localization.locale;
i18n.fallbacks = true;

export default i18n;