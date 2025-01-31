import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'none', // Disable the default navigation animation since we're doing our own
            gestureEnabled: false, // Disable the iOS swipe back gesture
        }} />
    );
}
