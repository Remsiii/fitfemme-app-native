import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Stack,
} from 'expo-router';
import { supabase } from '../lib/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes: string;
}

const SkeletonLoader = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScrollView style={styles.container}>
      {/* Skeleton Chart Card */}
      <View style={styles.chartCard}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonChart, { opacity }]} />
      </View>

      {/* Skeleton Add Button */}
      <Animated.View style={[styles.skeletonAddButton, { opacity }]} />

      {/* Skeleton History Section */}
      <View style={styles.historySection}>
        <Animated.View style={[styles.skeletonTitle, { opacity, width: '40%' }]} />
        
        {/* Skeleton History Items */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.historyCard}>
            <View style={styles.historyMain}>
              <Animated.View style={[styles.skeletonWeight, { opacity }]} />
              <Animated.View style={[styles.skeletonDate, { opacity }]} />
            </View>
            <Animated.View style={[styles.skeletonNote, { opacity }]} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default function WeightTrackerScreen() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeightHistory();
  }, []);

  const fetchWeightHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setWeightEntries(data || []);
    } catch (error) {
      console.error('Error fetching weight history:', error);
      Alert.alert('Error', 'Failed to load weight history');
    } finally {
      setIsLoading(false);
    }
  };

  const addWeightEntry = async () => {
    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        Alert.alert('Invalid Weight', 'Please enter a valid weight');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('weight_tracking')
        .insert([
          {
            user_id: user.id,
            weight,
            date: today,
            notes: notes.trim(),
          }
        ]);

      if (error) throw error;

      // Update user's current weight
      await supabase
        .from('users')
        .update({ weight })
        .eq('id', user.id);

      setNewWeight('');
      setNotes('');
      setShowAddModal(false);
      fetchWeightHistory();
      Alert.alert('Success', 'Weight entry added successfully');
    } catch (error) {
      console.error('Error adding weight entry:', error);
      Alert.alert('Error', 'Failed to add weight entry');
    }
  };

  const chartData = {
    labels: weightEntries.map(entry => entry.date.split('-')[2]), // Show only days
    datasets: [{
      data: weightEntries.map(entry => entry.weight),
      color: (opacity = 1) => `rgba(146, 163, 253, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Weight Tracker',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Weight Chart */}
          {weightEntries.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weight Progress</Text>
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(146, 163, 253, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#92A3FD',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No weight entries yet</Text>
              <Text style={styles.noDataSubtext}>Start tracking your weight journey!</Text>
            </View>
          )}

          {/* Add Weight Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <LinearGradient
              colors={['#92A3FD', '#9DCEFF']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Weight Entry</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Weight History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>History</Text>
            {weightEntries.slice().reverse().map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyMain}>
                  <Text style={styles.weightValue}>{entry.weight} kg</Text>
                  <Text style={styles.dateText}>{entry.date}</Text>
                </View>
                {entry.notes && (
                  <Text style={styles.noteText}>{entry.notes}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Add Weight Modal */}
          {showAddModal && (
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Weight Entry</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Weight (kg)"
                  keyboardType="decimal-pad"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
                
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Notes (optional)"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowAddModal(false);
                      setNewWeight('');
                      setNotes('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={addWeightEntry}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1D1617',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    margin: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1617',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#7B6F72',
    marginTop: 8,
  },
  addButton: {
    margin: 16,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1617',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92A3FD',
  },
  dateText: {
    fontSize: 14,
    color: '#7B6F72',
  },
  noteText: {
    fontSize: 14,
    color: '#7B6F72',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1617',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F7F8F8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F7F8F8',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#92A3FD',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#7B6F72',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Skeleton Styles
  skeletonTitle: {
    height: 24,
    backgroundColor: '#E1E9FF',
    borderRadius: 12,
    width: '60%',
    marginBottom: 16,
  },
  skeletonChart: {
    height: 220,
    backgroundColor: '#E1E9FF',
    borderRadius: 16,
  },
  skeletonAddButton: {
    height: 56,
    backgroundColor: '#E1E9FF',
    borderRadius: 16,
    margin: 16,
  },
  skeletonWeight: {
    height: 24,
    backgroundColor: '#E1E9FF',
    borderRadius: 12,
    width: '30%',
  },
  skeletonDate: {
    height: 20,
    backgroundColor: '#E1E9FF',
    borderRadius: 10,
    width: '25%',
  },
  skeletonNote: {
    height: 16,
    backgroundColor: '#E1E9FF',
    borderRadius: 8,
    width: '70%',
    marginTop: 8,
  },
});
