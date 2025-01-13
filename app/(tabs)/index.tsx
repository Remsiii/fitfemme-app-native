import { Image, StyleSheet, Platform, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import '@/i18n';  // Import i18n configuration
import { HomeScreen as CustomHomeScreen } from '@/components/HomeScreen';  // Import with alias
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp } from '@/types/navigation';

export default function TabHomeScreen() {  
  const navigation = useNavigation<NavigationProp>();
  return (
    <ThemedView style={styles.container}>
      <CustomHomeScreen navigation={navigation} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});