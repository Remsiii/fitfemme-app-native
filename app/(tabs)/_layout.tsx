import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme, Platform, StyleSheet, View } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, props.focused && styles.activeIconContainer]}>
      <FontAwesome size={24} {...props} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { triggerHaptic } = useSettings();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff758f',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 10,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 20,
          height: 55,
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          ...Platform.select({
            ios: {
              backdropFilter: 'blur(20px)',
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarItemStyle: {
          height: 55,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
        headerTransparent: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
      }}
      screenListeners={{
        tabPress: () => {
          triggerHaptic();
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable onPress={() => triggerHaptic()}>
                {({ pressed }) => (
                  <FontAwesome
                    name="gear"
                    size={25}
                    color={isDark ? '#fff' : '#000'}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name="barbell-outline" size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="wellness"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name="flower-outline" size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 15,
  },
  activeIconContainer: {
    backgroundColor: '#fff1f3',
  },
});
