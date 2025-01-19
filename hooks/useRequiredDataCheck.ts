import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
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

    useEffect(() => {
        checkUserData();
    }, []);

    const checkUserData = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                router.replace('/register');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setUserData(data);

            const missing = {
                gender: !data.gender,
                birth_date: !data.birth_date,
                weight: !data.weight,
                height: !data.height,
                fitness_goal: !data.fitness_goal,
            };

            setMissingFields(missing);

            // If any required field is missing, redirect to profile setup
            if (Object.values(missing).some(field => field)) {
                router.push('/profile-setup');
            }
        } catch (error) {
            console.error('Error checking user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { userData, missingFields, isLoading };
};
