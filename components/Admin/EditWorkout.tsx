import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, Modal, Image } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';

interface Exercise {
    id: string;
    name: string;
    duration: string;
    reps: string;
    video_url?: string;
    image_url?: string;
    set_number: number;
    workout_id: number;
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
    schedule_time?: string;
    exercises?: Exercise[];
    icon?: string;
}

export default function EditWorkout() {
    const params = useLocalSearchParams();
    const workoutId = params.id ? parseInt(params.id as string) : null;
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
        name: '',
        duration: '',
        reps: '',
        image_url: '',
        video_url: '',
        set_number: 1
    });

    useEffect(() => {
        if (workoutId) {
            fetchWorkout();
        } else {
            setLoading(false);
        }
    }, [workoutId]);

    const fetchWorkout = async () => {
        try {
            const { data: workoutData, error: workoutError } = await supabase
                .from('workouts')
                .select('*')
                .eq('id', workoutId)
                .single();

            if (workoutError) throw workoutError;

            const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .eq('workout_id', workoutId)
                .order('set_number', { ascending: true });

            if (exercisesError) throw exercisesError;

            setWorkout(workoutData);
            setExercises(exercisesData || []);
        } catch (error) {
            console.error('Error fetching workout:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWorkout = async (updates: Partial<Workout>) => {
        if (!workoutId) return;

        try {
            const { error } = await supabase
                .from('workouts')
                .update(updates)
                .eq('id', workoutId);

            if (error) throw error;

            setWorkout(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error('Error updating workout:', error);
        }
    };

    const handleAddExercise = async () => {
        setModalVisible(true);
    };

    const handleEditExercise = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setNewExercise(exercise);
        setModalVisible(true);
    };

    const handleSaveExercise = async () => {
        if (!workoutId) return;

        try {
            if (editingExercise) {
                // Update existierende Übung
                const { error } = await supabase
                    .from('exercises')
                    .update({
                        name: newExercise.name,
                        duration: newExercise.duration,
                        reps: newExercise.reps,
                        image_url: newExercise.image_url,
                        video_url: newExercise.video_url
                    })
                    .eq('id', editingExercise.id);

                if (error) throw error;

                // Aktualisiere die lokale Liste
                setExercises(exercises.map(ex => 
                    ex.id === editingExercise.id 
                        ? { ...ex, ...newExercise }
                        : ex
                ));
            } else {
                // Füge neue Übung hinzu
                const { data, error } = await supabase
                    .from('exercises')
                    .insert([
                        {
                            ...newExercise,
                            workout_id: workoutId,
                            set_number: exercises.length + 1
                        }
                    ])
                    .select();

                if (error) throw error;
                if (data) {
                    setExercises([...exercises, data[0]]);
                }
            }

            // Reset und schließe Modal
            setModalVisible(false);
            setEditingExercise(null);
            setNewExercise({
                name: '',
                duration: '',
                reps: '',
                image_url: '',
                video_url: '',
                set_number: exercises.length + 1
            });
        } catch (error) {
            console.error('Error saving exercise:', error);
            Alert.alert('Fehler', 'Übung konnte nicht gespeichert werden');
        }
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        try {
            const { error } = await supabase
                .from('exercises')
                .delete()
                .eq('id', exerciseId);

            if (error) throw error;

            const newExercises = exercises.filter(e => e.id !== exerciseId);
            setExercises(newExercises);

            // Update set numbers
            const updatedExercises = newExercises.map((exercise, index) => ({
                ...exercise,
                set_number: index + 1
            }));

            await Promise.all(
                updatedExercises.map(exercise =>
                    supabase
                        .from('exercises')
                        .update({ set_number: exercise.set_number })
                        .eq('id', exercise.id)
                )
            );

            setExercises(updatedExercises);
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    };

    const handleSave = async () => {
        if (!workout || !workoutId) return;

        try {
            const { error: workoutError } = await supabase
                .from('workouts')
                .update({
                    name: workout.name,
                    type: workout.type,
                    difficulty: workout.difficulty,
                    duration: workout.duration,
                    description: workout.description
                })
                .eq('id', workoutId);

            if (workoutError) throw workoutError;

            // Direkt zurück navigieren
            router.back();
        } catch (error) {
            console.error('Error saving workout:', error);
            Alert.alert('Fehler', 'Workout konnte nicht gespeichert werden');
        }
    };

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets[0]) {
                const file = result.assets[0];

                // Für Web: Hole die Datei direkt aus dem File-Objekt
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${workoutId}/${fileName}`;

                // Upload to Supabase Storage
                const { error: uploadError, data } = await supabase.storage
                    .from('workout-media')
                    .upload(filePath, blob, {
                        contentType: file.mimeType,
                        upsert: true,
                        cacheControl: '3600'
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('workout-media')
                    .getPublicUrl(filePath);

                setNewExercise(prev => ({
                    ...prev,
                    video_url: publicUrl
                }));
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            Alert.alert('Fehler', 'Video konnte nicht hochgeladen werden. Bitte stellen Sie sicher, dass Sie angemeldet sind und die notwendigen Berechtigungen haben.');
        }
    };

    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets[0]) {
                const file = result.assets[0];

                // Für Web: Hole die Datei direkt aus dem File-Objekt
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${workoutId}/${fileName}`;

                // Upload to Supabase Storage
                const { error: uploadError, data } = await supabase.storage
                    .from('workout-images')
                    .upload(filePath, blob, {
                        contentType: file.mimeType,
                        upsert: true,
                        cacheControl: '3600'
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('workout-images')
                    .getPublicUrl(filePath);

                setNewExercise(prev => ({
                    ...prev,
                    image_url: publicUrl
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Fehler', 'Bild konnte nicht hochgeladen werden. Bitte stellen Sie sicher, dass Sie angemeldet sind und die notwendigen Berechtigungen haben.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Laden...</Text>
            </View>
        );
    }

    if (!workout) {
        return (
            <View style={styles.errorContainer}>
                <Text>Workout nicht gefunden</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Workout bearbeiten',
                    headerStyle: { backgroundColor: '#fff' },
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Workout Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Workout Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={workout?.name}
                                onChangeText={(text) => setWorkout(prev => prev ? { ...prev, name: text } : null)}
                                placeholder="Workout Name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Beschreibung</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={workout?.description}
                                onChangeText={(text) => setWorkout(prev => prev ? { ...prev, description: text } : null)}
                                placeholder="Workout Beschreibung"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dauer (Minuten)</Text>
                            <TextInput
                                style={styles.input}
                                value={workout?.duration.toString()}
                                onChangeText={(text) => setWorkout(prev => prev ? { ...prev, duration: parseInt(text) || 0 } : null)}
                                keyboardType="number-pad"
                                placeholder="Dauer in Minuten"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Schwierigkeit</Text>
                            <TextInput
                                style={styles.input}
                                value={workout?.difficulty}
                                onChangeText={(text) => setWorkout(prev => prev ? { ...prev, difficulty: text } : null)}
                                placeholder="Schwierigkeit"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Typ</Text>
                            <TextInput
                                style={styles.input}
                                value={workout?.type}
                                onChangeText={(text) => setWorkout(prev => prev ? { ...prev, type: text } : null)}
                                placeholder="Workout Typ"
                            />
                        </View>
                    </View>

                    {/* Exercises List */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Übungen</Text>
                        
                        {exercises.map((exercise, index) => (
                            <View key={exercise.id} style={styles.exerciseItem}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseNumber}>{index + 1}.</Text>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <View style={styles.exerciseActions}>
                                        <TouchableOpacity
                                            onPress={() => handleEditExercise(exercise)}
                                            style={styles.actionButton}
                                        >
                                            <Ionicons name="pencil-outline" size={24} color="#92A3FD" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteExercise(exercise.id)}
                                            style={styles.actionButton}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#FF4B4B" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <View style={styles.exerciseDetails}>
                                    <Text style={styles.exerciseInfo}>
                                        {exercise.duration} • {exercise.reps} Wiederholungen
                                    </Text>
                                    {exercise.image_url && (
                                        <Image 
                                            source={{ uri: exercise.image_url }}
                                            style={styles.exerciseImage}
                                        />
                                    )}
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setEditingExercise(null);
                                setNewExercise({
                                    name: '',
                                    duration: '',
                                    reps: '',
                                    image_url: '',
                                    video_url: '',
                                    set_number: exercises.length + 1
                                });
                                setModalVisible(true);
                            }}
                        >
                            <LinearGradient
                                colors={['#92A3FD', '#9DCEFF']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.buttonText}>+ Übung hinzufügen</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <LinearGradient
                            colors={['#92A3FD', '#9DCEFF']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.buttonText}>Änderungen speichern</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Exercise Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setEditingExercise(null);
                    setNewExercise({
                        name: '',
                        duration: '',
                        reps: '',
                        image_url: '',
                        video_url: '',
                        set_number: exercises.length + 1
                    });
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingExercise ? 'Übung bearbeiten' : 'Neue Übung hinzufügen'}
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={newExercise.name}
                                onChangeText={(text) => setNewExercise(prev => ({ ...prev, name: text }))}
                                placeholder="Übungsname"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dauer (z.B. '30 Sekunden')</Text>
                            <TextInput
                                style={styles.input}
                                value={newExercise.duration}
                                onChangeText={(text) => setNewExercise(prev => ({ ...prev, duration: text }))}
                                placeholder="Dauer"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Wiederholungen (z.B. '12x')</Text>
                            <TextInput
                                style={styles.input}
                                value={newExercise.reps}
                                onChangeText={(text) => setNewExercise(prev => ({ ...prev, reps: text }))}
                                placeholder="Wiederholungen"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bild</Text>
                            <View style={styles.fileInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.fileInput]}
                                    value={newExercise.image_url}
                                    placeholder="Kein Bild ausgewählt"
                                    editable={false}
                                />
                                <TouchableOpacity
                                    style={styles.fileButton}
                                    onPress={pickImage}
                                >
                                    <LinearGradient
                                        colors={['#92A3FD', '#9DCEFF']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.buttonText}>Auswählen</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Video</Text>
                            <View style={styles.fileInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.fileInput]}
                                    value={newExercise.video_url}
                                    placeholder="Kein Video ausgewählt"
                                    editable={false}
                                />
                                <TouchableOpacity
                                    style={styles.fileButton}
                                    onPress={pickVideo}
                                >
                                    <LinearGradient
                                        colors={['#92A3FD', '#9DCEFF']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.buttonText}>Auswählen</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditingExercise(null);
                                    setNewExercise({
                                        name: '',
                                        duration: '',
                                        reps: '',
                                        image_url: '',
                                        video_url: '',
                                        set_number: exercises.length + 1
                                    });
                                }}
                            >
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveExercise}
                            >
                                <LinearGradient
                                    colors={['#92A3FD', '#9DCEFF']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.buttonText}>
                                        {editingExercise ? 'Speichern' : 'Hinzufügen'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3142',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#2D3142',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E9F2',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#2D3142',
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    exerciseItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#92A3FD',
        marginRight: 8,
    },
    exerciseName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#2D3142',
    },
    exerciseActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 5,
    },
    exerciseDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseInfo: {
        fontSize: 14,
        color: '#4F5E7B',
    },
    exerciseImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        marginTop: 10,
    },
    addButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 24,
        marginBottom: 32,
    },
    buttonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: '#F7F8F8',
        padding: 14,
    },
    fileInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    fileInput: {
        flex: 1,
        backgroundColor: '#F7F8F8',
    },
    fileButton: {
        borderRadius: 12,
        overflow: 'hidden',
        width: 100,
    },
});
