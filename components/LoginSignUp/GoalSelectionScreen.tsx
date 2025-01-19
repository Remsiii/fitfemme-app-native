import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const goals = [
    {
        id: 'weight-loss',
        title: 'Weight Loss',
        description: 'Burn fat and achieve a leaner physique',
        icon: 'scale-outline',
        gradient: ['#FF6B9C', '#FF9DC4'],
    },
    {
        id: 'muscle-gain',
        title: 'Muscle Gain',
        description: 'Build strength and increase muscle mass',
        icon: 'barbell-outline',
        gradient: ['#7C9EFF', '#A5B9FF'],
    },
    {
        id: 'stay-fit',
        title: 'Stay Fit',
        description: 'Maintain fitness and improve overall health',
        icon: 'fitness-outline',
        gradient: ['#FFB86B', '#FFD4A0'],
    },
    {
        id: 'flexibility',
        title: 'Flexibility',
        description: 'Enhance mobility and reduce muscle tension',
        icon: 'body-outline',
        gradient: ['#6BE3FF', '#A0EEFF'],
    }
];

export default function GoalSelectionScreen() {
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleContinue = async () => {
        if (!selectedGoal) {
            Alert.alert('Please Select', 'Choose a fitness goal to continue');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('users')
                .update({
                    goal: selectedGoal,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;
            router.push('/(tabs)');
        } catch (error) {
            console.error('Error saving goal:', error);
            Alert.alert('Error', 'Failed to save your goal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose Your Goal</Text>
                    <Text style={styles.subtitle}>
                        Select a fitness goal that matches your aspirations
                    </Text>
                </View>

                <View style={styles.goalsContainer}>
                    {goals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.goalCard,
                                selectedGoal === goal.id && styles.selectedCard
                            ]}
                            onPress={() => setSelectedGoal(goal.id)}
                        >
                            <LinearGradient
                                colors={goal.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name={goal.icon} size={32} color="#fff" />
                                    </View>
                                    <Text style={styles.goalTitle}>{goal.title}</Text>
                                    <Text style={styles.goalDescription}>
                                        {goal.description}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={['#7C9EFF', '#FF6B9C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    goalsContainer: {
        gap: 16,
    },
    goalCard: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    selectedCard: {
        transform: [{ scale: 1.02 }],
        shadowOpacity: 0.2,
    },
    cardGradient: {
        padding: 20,
    },
    cardContent: {
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    goalDescription: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    button: {
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 32,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});