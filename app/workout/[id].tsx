import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

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
}

export default function WorkoutDetailScreen() {
    const params = useLocalSearchParams();
    const workoutId = params.id ? parseInt(params.id as string) : null;
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const videoRef = useRef<Video | null>(null);

    useEffect(() => {
        if (workoutId) {
            fetchWorkout();
        }
    }, [workoutId]);

    const fetchWorkout = async () => {
        try {
            const { data: workoutData, error: workoutError } = await supabase
                .from('workouts')
                .select(`
                    *,
                    exercises (*)
                `)
                .eq('id', workoutId)
                .single();

            if (workoutError) throw workoutError;

            setWorkout(workoutData);
        } catch (error) {
            console.error('Error fetching workout:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPress = async (videoUrl: string) => {
        setSelectedVideo(videoUrl);
        // Wenn ein Video geöffnet wird, stellen wir sicher, dass es von Anfang an abgespielt wird
        if (videoRef.current) {
            await videoRef.current.setStatusAsync({
                shouldPlay: true,
                positionMillis: 0
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Lädt Workout...</Text>
            </View>
        );
    }

    if (!workout) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Workout nicht gefunden</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: workout.name,
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={styles.scrollView}>
                <LinearGradient
                    colors={['#92A3FD', '#9DCEFF']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.workoutName}>{workout.name}</Text>
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
                </LinearGradient>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Beschreibung</Text>
                    <Text style={styles.description}>{workout.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Übungen</Text>
                    {workout.exercises?.map((exercise, index) => (
                        <View key={exercise.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <Text style={styles.exerciseNumber}>{index + 1}.</Text>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                            </View>

                            {exercise.image_url && (
                                <Image
                                    source={{ uri: exercise.image_url }}
                                    style={styles.exerciseImage}
                                />
                            )}

                            <View style={styles.exerciseDetails}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="time-outline" size={16} color="#4F5E7B" />
                                    <Text style={styles.exerciseDetailText}>{exercise.duration}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="repeat-outline" size={16} color="#4F5E7B" />
                                    <Text style={styles.exerciseDetailText}>{exercise.reps} Wiederholungen</Text>
                                </View>
                            </View>

                            {exercise.video_url && (
                                <TouchableOpacity
                                    style={styles.videoButton}
                                    onPress={() => handleVideoPress(exercise.video_url!)}
                                >
                                    <Ionicons name="play-circle-outline" size={24} color="#92A3FD" />
                                    <Text style={styles.videoButtonText}>Video ansehen</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Video Modal */}
            <RNModal
                animationType="fade"
                transparent={true}
                visible={!!selectedVideo}
                onRequestClose={() => setSelectedVideo(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.videoContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedVideo(null)}
                        >
                            <Ionicons name="close-circle" size={32} color="#fff" />
                        </TouchableOpacity>

                        {selectedVideo && (
                            <Video
                                ref={videoRef}
                                style={styles.video}
                                source={{ uri: selectedVideo }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping={false}
                                shouldPlay={true}
                            />
                        )}
                    </View>
                </View>
            </RNModal>
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
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#4F5E7B',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#FF4B4B',
    },
    header: {
        padding: 20,
    },
    workoutName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    workoutDetails: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3142',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#4F5E7B',
        lineHeight: 20,
    },
    exerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E9EF',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92A3FD',
        marginRight: 8,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3142',
    },
    exerciseImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginVertical: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    exerciseDetailText: {
        fontSize: 14,
        color: '#4F5E7B',
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F7F8F8',
    },
    videoButtonText: {
        fontSize: 14,
        color: '#92A3FD',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: -40,
        right: 16,
        zIndex: 1,
    },
});
