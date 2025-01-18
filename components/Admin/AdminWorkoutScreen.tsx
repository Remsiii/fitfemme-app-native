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
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function AdminWorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch workouts');
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    router.push({
      pathname: '/admin/edit-workout',
      params: { workoutId: workout.id }
    });
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('workouts')
                .delete()
                .eq('id', workoutId);

              if (error) throw error;
              setWorkouts(workouts.filter(w => w.id !== workoutId));
              Alert.alert('Success', 'Workout deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
              console.error('Error deleting workout:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.workoutList}>
        {workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDetails}>
                {workout.type} • {workout.difficulty} • {workout.duration} min
              </Text>
              <Text style={styles.workoutDescription} numberOfLines={2}>
                {workout.description}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditWorkout(workout)}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteWorkout(workout.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  workoutList: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutInfo: {
    flex: 1,
    marginRight: 16,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});
