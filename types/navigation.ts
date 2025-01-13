import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationState } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Notifications: undefined;
  // Add other screens here
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootNavigationState = NavigationState & { preloadedRoutes?: any[] };
export type RootParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  // Add other screen names and their parameter types here as needed
};
