import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Exercise {
    id: string;
    name: string;
    duration: string;
    reps: string;
    video_url?: string;
    image_url?: string;
    set_number: number;
}

interface Workout {
    id: number;
    name: string;
    type: string;
    difficulty: string;
    duration: number;
    description: string;
    exercise_count: number;
    calories_burned: number;
    exercises?: Exercise[];
    icon?: string;
}

export default function WorkoutsScreen() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const { data: workoutsData, error: workoutsError } = await supabase
                .from('workouts')
                .select(`
                    *,
                    exercises (*)
                `)
                .order('name');

            if (workoutsError) throw workoutsError;

            setWorkouts(workoutsData || []);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return '#92A3FD';
            case 'intermediate':
                return '#FFA07A';
            case 'advanced':
                return '#FF4B4B';
            default:
                return '#92A3FD';
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Workouts',
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={styles.scrollView}>
                {loading ? (
                    <Text style={styles.loadingText}>Lädt Workouts...</Text>
                ) : workouts.length === 0 ? (
                    <Text style={styles.noWorkoutsText}>Keine Workouts gefunden</Text>
                ) : (
                    workouts.map((workout) => (
                        <TouchableOpacity
                            key={workout.id}
                            style={styles.workoutCard}
                            onPress={() => router.push(`/workout/${workout.id}`)}
                        >
                            <LinearGradient
                                colors={['#92A3FD', '#9DCEFF']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {workout.icon && (
                                    <Image 
                                        source={{ uri: workout.icon }}
                                        style={styles.workoutImage}
                                    />
                                )}
                                <View style={styles.workoutHeader}>
                                    <Text style={styles.workoutName}>{workout.name}</Text>
                                    <View style={[
                                        styles.difficultyBadge,
                                        { backgroundColor: getDifficultyColor(workout.difficulty) }
                                    ]}>
                                        <Text style={styles.difficultyText}>
                                            {workout.difficulty}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.workoutDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={20} color="#fff" />
                                        <Text style={styles.detailText}>{workout.duration} Min</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="fitness-outline" size={20} color="#fff" />
                                        <Text style={styles.detailText}>{workout.exercise_count} Übungen</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="flame-outline" size={20} color="#fff" />
                                        <Text style={styles.detailText}>{workout.calories_burned} kcal</Text>
                                    </View>
                                </View>

                                <Text style={styles.workoutDescription} numberOfLines={2}>
                                    {workout.description}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#4F5E7B',
    },
    noWorkoutsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#4F5E7B',
    },
    workoutCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardGradient: {
        padding: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    workoutName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    difficultyText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    workoutDetails: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 12,
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        color: '#fff',
        fontSize: 14,
    },
    workoutImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    workoutDescription: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
});
