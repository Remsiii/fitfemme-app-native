import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: false,
                title: '',
                header: () => null
            }}
        >
            <Stack.Screen 
                name="index" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="track-goal" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="get-burn" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="eat-well" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="improve-sleep" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="goals" 
                options={{ headerShown: false, title: '' }} 
            />
            <Stack.Screen 
                name="profile" 
                options={{ headerShown: false, title: '' }} 
            />
        </Stack>
    );
} 