import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';

export interface UserData {
    id: string;
    gender: string | null;
    birth_date: string | null;
    weight: number | null;
    height: number | null;
    fitness_goal: string | null;
}

export interface MissingFields {
    gender: boolean;
    birth_date: boolean;
    weight: boolean;
    height: boolean;
    fitness_goal: boolean;
}

export const useRequiredDataCheck = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [missingFields, setMissingFields] = useState<MissingFields>({
        gender: false,
        birth_date: false,
        weight: false,
        height: false,
        fitness_goal: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    const checkUserData = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                if (segments[0] !== '(auth)') {
                    router.replace('/register');
                }
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
                return;
            }

            setUserData(data);

            const missing = {
                gender: !data?.gender,
                birth_date: !data?.birth_date,
                weight: !data?.weight,
                height: !data?.height,
                fitness_goal: !data?.fitness_goal,
            };

            setMissingFields(missing);
        } catch (error) {
            console.error('Error checking user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (segments[0] !== undefined) {
            checkUserData();
        }
    }, [segments]);

    return { userData, missingFields, isLoading };
};
