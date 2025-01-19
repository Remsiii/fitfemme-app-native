import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';

export const useAuthProtection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkAuth();
        
        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                router.replace('/login');
            } else if (event === 'SIGNED_IN' && session) {
                setIsAuthenticated(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            setIsAuthenticated(!!session);
            
            // If we're in a protected route (tabs) and not authenticated, redirect to login
            if (!session && segments[0] === '(tabs)') {
                router.replace('/login');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            router.replace('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // The onAuthStateChange listener will handle the navigation
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return { isLoading, isAuthenticated, handleLogout };
};
