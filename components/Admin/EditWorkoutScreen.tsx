import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { supabase } from '../../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Exercise {
  id: number;
  name: string;
  duration: string;
  reps: string;
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
  exercises_count: number;
  calories_burned: number;
  schedule_time: string | null;
  icon: string | null;
}

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout>({
    id: 0,
    name: '',
    type: '',
    difficulty: '',
    duration: 0,
    description: '',
    exercises_count: 0,
    calories_burned: 0,
    schedule_time: null,
    icon: null,
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
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
      Alert.alert('Error', 'Failed to fetch workout details');
      console.error('Error fetching workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          name: workout.name,
          type: workout.type,
          difficulty: workout.difficulty,
          duration: workout.duration,
          description: workout.description,
          calories_burned: workout.calories_burned,
          schedule_time: workout.schedule_time,
          icon: workout.icon,
        })
        .eq('id', workoutId);

      if (error) throw error;

      Alert.alert('Success', 'Workout updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update workout');
      console.error('Error updating workout:', error);
    }
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now(),
      name: '',
      duration: '',
      reps: '',
      set_number: exercises.length + 1,
      workout_id: Number(workoutId),
    };
    setExercises([...exercises, newExercise]);
  };

  const handleUpdateExercise = async (exerciseId: number, updatedExercise: Partial<Exercise>) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update(updatedExercise)
        .eq('id', exerciseId);

      if (error) throw error;

      setExercises(exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, ...updatedExercise } : ex
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise');
      console.error('Error updating exercise:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;

      setExercises(exercises.filter(ex => ex.id !== exerciseId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exercise');
      console.error('Error deleting exercise:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Workout</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={workout.name}
          onChangeText={(text) => setWorkout({ ...workout, name: text })}
          placeholder="Workout name"
        />

        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          value={workout.type}
          onChangeText={(text) => setWorkout({ ...workout, type: text })}
          placeholder="Workout type"
        />

        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          style={styles.input}
          value={workout.difficulty}
          onChangeText={(text) => setWorkout({ ...workout, difficulty: text })}
          placeholder="Difficulty level"
        />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={workout.duration.toString()}
          onChangeText={(text) => setWorkout({ ...workout, duration: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholder="Duration in minutes"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={workout.description}
          onChangeText={(text) => setWorkout({ ...workout, description: text })}
          placeholder="Workout description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Calories Burned</Text>
        <TextInput
          style={styles.input}
          value={workout.calories_burned.toString()}
          onChangeText={(text) => setWorkout({ ...workout, calories_burned: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholder="Estimated calories burned"
        />

        <Text style={styles.label}>Icon</Text>
        <TextInput
          style={styles.input}
          value={workout.icon || ''}
          onChangeText={(text) => setWorkout({ ...workout, icon: text })}
          placeholder="Icon name (optional)"
        />

        <Text style={styles.label}>Schedule Time</Text>
        <TextInput
          style={styles.input}
          value={workout.schedule_time || ''}
          onChangeText={(text) => setWorkout({ ...workout, schedule_time: text })}
          placeholder="Schedule time (optional)"
        />

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <TouchableOpacity onPress={handleAddExercise} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
            <TextInput
              style={styles.input}
              value={exercise.name}
              onChangeText={(text) => handleUpdateExercise(exercise.id, { name: text })}
              placeholder="Exercise name"
            />
            <View style={styles.exerciseDetails}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={exercise.duration}
                onChangeText={(text) => handleUpdateExercise(exercise.id, { duration: text })}
                placeholder="Duration"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={exercise.reps}
                onChangeText={(text) => handleUpdateExercise(exercise.id, { reps: text })}
                placeholder="Reps"
              />
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteExercise(exercise.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  exercisesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
});
