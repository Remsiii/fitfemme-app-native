import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { NavigationProp } from '../types/navigation';

// Types
interface WorkoutData {
    id: number;
    name: string;
    description: string;
    duration?: number;
    calories_burn?: number;
    progress?: number;
    icon?: string;
    difficulty?: string;
    category?: string;
}

interface UserProfile {
    name: string;
}

interface Props {
    navigation: NavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const [currentHeartRate, setCurrentHeartRate] = useState(72);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
    });
    const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: authUser, error: authError } = await supabase.auth.getUser();

                if (authError || !authUser?.user) {
                    navigation.navigate('Login');
                    throw new Error('User is not authenticated');
                }

                const userId = authUser.user.id;

                const { data: profileData, error: dbError } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', userId)
                    .single();

                if (dbError) throw dbError;

                setProfile({
                    name: profileData.full_name || 'New User',
                });

                await supabase.auth.updateUser({
                    data: { metadata_name: profileData.full_name },
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // Fetch workouts
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('workouts')
                    .select('*')
                    .limit(5);

                if (error) throw error;
                if (data) setWorkouts(data);
            } catch (error) {
                console.error('Error fetching workouts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkouts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>{t('Welcome Back')}</Text>
                        <Text style={styles.nameText}>{profile.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Icon name="bell" size={24} color="#000" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                {/* Today Target Card */}
                <View style={styles.targetCard}>
                    <View style={styles.targetContent}>
                        <Text style={styles.targetText}>{t('Today Target')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.checkButton}>{t('Check')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Activity Status */}
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>{t('Activity Status')}</Text>

                    {/* Heart Rate Card */}
                    <View style={styles.heartRateCard}>
                        <View style={styles.heartRateContent}>
                            <View>
                                <Text style={styles.cardTitle}>{t('Heart Rate')}</Text>
                                <Text style={styles.heartRateValue}>{currentHeartRate} BPM</Text>
                            </View>
                            <View style={styles.iconContainer}>
                                <Icon name="heart" size={24} color="#fff" />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    welcomeText: {
        color: '#666',
        fontSize: 14,
    },
    nameText: {
        color: '#000',
        fontSize: 20,
        fontWeight: '600',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF0000',
    },
    targetCard: {
        margin: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#92A3FD',
    },
    targetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    targetText: {
        color: '#000',
        fontWeight: '500',
    },
    checkButton: {
        color: '#fff',
    },
    activitySection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    heartRateCard: {
        backgroundColor: '#92A3FD',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    heartRateContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: {
        color: '#000',
        fontWeight: '500',
        marginBottom: 8,
    },
    heartRateValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;