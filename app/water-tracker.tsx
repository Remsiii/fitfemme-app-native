import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';

const screenWidth = Dimensions.get('window').width;

interface WaterLog {
  amount: number;
  timestamp: string;
}

export default function WaterTracker() {
  const router = useRouter();
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchWaterLogs(), loadDailyGoal()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaterLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_activities')
        .select('water_intake_ml, created_at')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const logs = data.map(log => ({
          amount: log.water_intake_ml,
          timestamp: new Date(log.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        }));
        setWaterLogs(logs);
        setTodayTotal(logs.reduce((sum, log) => sum + log.amount, 0));
      }
    } catch (error) {
      console.error('Error fetching water logs:', error);
      Alert.alert('Error', 'Failed to fetch water logs');
    }
  };

  const loadDailyGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('daily_water_goal_ml')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data && data.daily_water_goal_ml) {
        setDailyGoal(data.daily_water_goal_ml);
        setNewGoal(data.daily_water_goal_ml.toString());
      }
    } catch (error) {
      console.error('Error loading daily goal:', error);
    }
  };

  const handleSaveGoal = async () => {
    const newGoalNum = parseInt(newGoal);
    if (isNaN(newGoalNum) || newGoalNum < 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ daily_water_goal_ml: newGoalNum })
        .eq('id', user.id);

      if (error) throw error;

      setDailyGoal(newGoalNum);
      setIsEditingGoal(false);
      Alert.alert('Success', 'Daily water goal updated successfully');
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save daily water goal');
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressColor = (): readonly [string, string] => {
    const progress = (todayTotal / dailyGoal) * 100;
    if (progress < 30) return ['#FF9B9B', '#FF6B6B'] as const;
    if (progress < 70) return ['#FFB86B', '#FF9B6B'] as const;
    return ['#6BCF91', '#4BA36E'] as const;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6B8CFF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  const addWaterIntake = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          water_intake_ml: amount,
          activity_date: today,
        });

      if (error) throw error;

      await fetchWaterLogs();
      Alert.alert('Success', `Added ${amount}ml of water!`);
    } catch (error) {
      console.error('Error adding water intake:', error);
      Alert.alert('Error', 'Failed to add water intake');
    }
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
    addWaterIntake(amount);
    setCustomAmount('');
    setIsAddingCustom(false);
  };

  const QuickAddButton = ({ amount }: { amount: number }) => (
    <TouchableOpacity
      style={styles.quickAddButton}
      onPress={() => addWaterIntake(amount)}
    >
      <View style={styles.quickAddContent}>
        <Ionicons name="water-outline" size={24} color="#fff" />
        <Text style={styles.quickAddText}>{amount}ml</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B8CFF" />
        <Text style={styles.loadingText}>Loading water tracker...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: 'Water Tracker',
          headerStyle: { backgroundColor: '#f5f5f5' },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <LinearGradient
            colors={getProgressColor()}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressText}>
              {todayTotal}ml / {dailyGoal}ml
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((todayTotal / dailyGoal) * 100, 100)}%` },
                ]}
              />
            </View>
          </LinearGradient>

          <View style={styles.goalSection}>
            <Text style={styles.sectionTitle}>Daily Goal</Text>
            {isEditingGoal ? (
              <View style={styles.goalEditContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={500}
                  maximumValue={5000}
                  step={100}
                  value={parseInt(newGoal) || dailyGoal}
                  onValueChange={value => setNewGoal(value.toString())}
                  minimumTrackTintColor="#6B8CFF"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#6B8CFF"
                />
                <Text style={styles.sliderValue}>{newGoal}ml</Text>
                <View style={styles.goalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditingGoal(false)}
                    disabled={isSaving}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveGoal}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.goalDisplay}
                onPress={() => setIsEditingGoal(true)}
              >
                <Text style={styles.goalText}>{dailyGoal}ml</Text>
                <Ionicons name="pencil" size={20} color="#6B8CFF" />
              </TouchableOpacity>
            )}
          </View>

          {waterLogs.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Today's Water Intake</Text>
              <LineChart
                data={{
                  labels: waterLogs.map(log => log.timestamp),
                  datasets: [{
                    data: waterLogs.map(log => log.amount)
                  }]
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          <View style={styles.addWaterSection}>
            <Text style={styles.sectionTitle}>Add Water</Text>
            <View style={styles.quickAddGrid}>
              <QuickAddButton amount={200} />
              <QuickAddButton amount={300} />
              <QuickAddButton amount={500} />
            </View>
            
            {isAddingCustom ? (
              <View style={styles.customAmountContainer}>
                <TextInput
                  style={styles.customAmountInput}
                  keyboardType="number-pad"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  placeholder="Enter amount in ml"
                  placeholderTextColor="#999"
                />
                <View style={styles.customAmountButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsAddingCustom(false);
                      setCustomAmount('');
                    }}
                  >
                    <Text style={[styles.buttonText, { color: '#666' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleCustomAmountSubmit}
                  >
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={() => setIsAddingCustom(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#6B8CFF" />
                <Text style={styles.customAddText}>Custom Amount</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  progressCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  goalSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  goalEditContainer: {
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B8CFF',
    marginTop: 10,
  },
  goalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6B8CFF',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  goalText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 15,
  },
  addWaterSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quickAddButton: {
    backgroundColor: '#6B8CFF',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAddContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 8,
  },
  customAddText: {
    color: '#6B8CFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customAmountContainer: {
    marginTop: 10,
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  customAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
