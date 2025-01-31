import React from 'react';
import { Pressable, StyleSheet, View, GestureResponderEvent, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

import { MotiView, useAnimationState } from 'moti';

type AddButtonProps = {
  onPress?: (event?: GestureResponderEvent) => void;
  focused: boolean;
};

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

// Unser mittiger Plus-Button mit horizontalem Menü
function AddButton({ onPress, focused }: AddButtonProps) {
  const animationState = useAnimationState({
    closed: { scale: 0, opacity: 0 },
    open: { scale: 1, opacity: 1 },
  });
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePress = (e?: GestureResponderEvent) => {
    // (Optional) Falls du einen onPress aus der TabBar nutzen willst:
    if (onPress) onPress(e);

    // Menu auf- oder zuklappen
    setIsOpen((prev) => !prev);
  };

  // Animation per Moti steuern
  React.useEffect(() => {
    if (isOpen) {
      animationState.transitionTo('open');
    } else {
      animationState.transitionTo('closed');
    }
  }, [isOpen]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Der runde Plus-Button */}
      <Pressable
        onPress={handlePress}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#ff758f',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20, // etwas Abstand nach oben
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      {/* Horizontales Menü für die drei Icons */}
      <MotiView
        state={animationState}
        transition={{ type: 'timing', duration: 300 }}
        style={{
          position: 'absolute',
          bottom: 80, // leicht über dem Plus-Button
          left: '50%',
          // Wir verschieben uns um die Hälfte (90px), damit es zentriert ist
          transform: [{ translateX: -90 }],
          width: 180, // Platz für drei Icons nebeneinander
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Linkes Icon */}
        <Pressable
          onPress={() => console.log('Linkes Icon geklickt')}
          style={styles.menuOption}
        >
          <Ionicons name="fitness-outline" size={20} color="#fff" />
        </Pressable>

        {/* Mittleres Icon */}
        <Pressable
          onPress={() => console.log('Mittleres Icon geklickt')}
          style={styles.menuOption}
        >
          <Ionicons name="water-outline" size={20} color="#fff" />
        </Pressable>

        {/* Rechtes Icon */}
        <Pressable
          onPress={() => console.log('Rechtes Icon geklickt')}
          style={styles.menuOption}
        >
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </Pressable>
      </MotiView>
    </View>
  );
}

export default function TabLayout() {
  const { triggerHaptic } = useSettings();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
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
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          ...Platform.select({
            ios: { backdropFilter: 'blur(20px)' },
            android: { elevation: 8 },
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
        headerLeftContainerStyle: {
          paddingLeft: 16,
          paddingTop: 0,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
          paddingTop: 0,
        },
      }}
      screenListeners={{
        tabPress: () => {
          triggerHaptic();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
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

      {/* Der Plus-Button: Wir legen eine "add"-Route an, navigieren aber NICHT hin, 
          sondern nutzen nur tabBarButton für das Menü. */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarButton: (props) => {
            // Normalerweise würde expo-router hier navigieren, 
            // wir wollen aber bleiben, also kein echtes onPress-Event durchreichen.
            const handlePress = () => {
              if (props.onPress) {
                // props.onPress();  // <-- wenn du NICHT navigieren willst, auskommentieren
              }
            };
            return (
              <AddButton
                onPress={handlePress}
                focused={!!props.accessibilityState?.selected}
              />
            );
          },
          // Kein Header nötig
          headerShown: false,
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
  // Stil für die drei horizontalen Menü-Icons
  menuOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff758f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
