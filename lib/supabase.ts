// src/lib/supabase.ts

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create a memory fallback for server-side rendering
const memoryStorage = new Map<string, string>();

// Create a custom storage adapter that works for both web and native
const customStorageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            // For native platforms, use AsyncStorage
            if (Platform.OS !== 'web') {
                return await AsyncStorage.getItem(key);
            }
            
            // For web, use memory storage during SSR and localStorage in browser
            if (typeof window === 'undefined') {
                return memoryStorage.get(key) || null;
            }
            
            // In browser context
            return window.localStorage.getItem(key);
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            // For native platforms, use AsyncStorage
            if (Platform.OS !== 'web') {
                await AsyncStorage.setItem(key, value);
                return;
            }
            
            // For web, use memory storage during SSR and localStorage in browser
            if (typeof window === 'undefined') {
                memoryStorage.set(key, value);
                return;
            }
            
            // In browser context
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            // For native platforms, use AsyncStorage
            if (Platform.OS !== 'web') {
                await AsyncStorage.removeItem(key);
                return;
            }
            
            // For web, use memory storage during SSR and localStorage in browser
            if (typeof window === 'undefined') {
                memoryStorage.delete(key);
                return;
            }
            
            // In browser context
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    }
};

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: customStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Create admin client (if needed)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
        storage: customStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    db: {
        schema: 'public',
    },
});

// Handle app state changes for native platforms
if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabaseClient.auth.startAutoRefresh();
        } else {
            supabaseClient.auth.stopAutoRefresh();
        }
    });
}

export const supabase = supabaseClient;