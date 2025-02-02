import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: false,
                presentation: 'modal',  // Dies verhindert den Standard-Header
                navigationBarHidden: true,  // Versteckt die Navigationsleiste
            }}
        />
    );
}
