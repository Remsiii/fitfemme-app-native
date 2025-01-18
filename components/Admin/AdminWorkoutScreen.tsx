import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

interface NewWorkout {
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  description: string;
}

const initialNewWorkout: NewWorkout = {
  name: '',
  type: '',
  difficulty: '',
  duration: 30,
  description: '',
};

export default function AdminWorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkout, setNewWorkout] = useState<NewWorkout>(initialNewWorkout);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkouts();
    }, [])
  );

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

  const handleAddWorkout = async () => {
    try {
      if (!newWorkout.name || !newWorkout.type || !newWorkout.difficulty) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          name: newWorkout.name,
          type: newWorkout.type,
          difficulty: newWorkout.difficulty,
          duration: newWorkout.duration,
          description: newWorkout.description,
          exercise_count: 0,
          calories_burned: 0
        })
        .select()
        .single();

      if (error) throw error;

      setWorkouts([data, ...workouts]);
      setModalVisible(false);
      setNewWorkout(initialNewWorkout);
      Alert.alert('Success', 'Workout added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add workout');
      console.error('Error adding workout:', error);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    router.push(`/admin/edit-workout?id=${workout.id}`);
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
        <ActivityIndicator size="large" color="#92A3FD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['#92A3FD', '#9DCEFF']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>+ Neues Workout</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView style={styles.workoutList}>
        {workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.workoutActions}>
                <TouchableOpacity
                  onPress={() => handleEditWorkout(workout)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={24} color="#92A3FD" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteWorkout(workout.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.workoutDetails}>
              <Text style={styles.workoutInfo}>
                {workout.duration} Min • {workout.difficulty} • {workout.type}
              </Text>
              <Text style={styles.workoutDescription} numberOfLines={2}>
                {workout.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neues Workout</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#2D3142" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkout.name}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
                  placeholder="Workout Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Typ *</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkout.type}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, type: text })}
                  placeholder="z.B. Cardio, Kraft, HIIT"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Schwierigkeit *</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkout.difficulty}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, difficulty: text })}
                  placeholder="z.B. Anfänger, Mittel, Fortgeschritten"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dauer (Minuten)</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkout.duration.toString()}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, duration: parseInt(text) || 0 })}
                  keyboardType="number-pad"
                  placeholder="30"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Beschreibung</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newWorkout.description}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, description: text })}
                  placeholder="Beschreibe das Workout..."
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddWorkout}
            >
              <LinearGradient
                colors={['#92A3FD', '#9DCEFF']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Workout hinzufügen</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutList: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3142',
    flex: 1,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  workoutDetails: {
    gap: 4,
  },
  workoutInfo: {
    fontSize: 14,
    color: '#4F5E7B',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#2D3142',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3142',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    marginBottom: 20,
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
});
