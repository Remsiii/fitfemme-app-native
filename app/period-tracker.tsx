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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface WaterLog {
  amount: number;
  timestamp: string;
}

export default function PeriodTracker() {
  const router = useRouter();
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    fetchWaterLogs();
  }, []);

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
          timestamp: new Date(log.created_at).toLocaleTimeString(),
        }));
        setWaterLogs(logs);
        setTodayTotal(logs.reduce((sum, log) => sum + log.amount, 0));
      }
    } catch (error) {
      console.error('Error fetching water logs:', error);
      Alert.alert('Error', 'Failed to fetch water logs');
    }
  };

  const handleSaveGoal = async () => {
    const newGoalNum = parseInt(newGoal);
    if (isNaN(newGoalNum) || newGoalNum < 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number');
      return;
    }

    setDailyGoal(newGoalNum);
    setIsEditingGoal(false);
    setNewGoal('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save the new goal to user preferences or settings table
      // You might need to create a new table for user preferences
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const getProgressColor = (): readonly [string, string] => {
    const progress = (todayTotal / dailyGoal) * 100;
    if (progress < 30) return ['#FF9B9B', '#FF6B6B'] as const;
    if (progress < 70) return ['#FFB86B', '#FF9B6B'] as const;
    return ['#6BCF91', '#4BA36E'] as const;
  };

  const chartData = {
    labels: waterLogs.map(log => log.timestamp),
    datasets: [
      {
        data: waterLogs.map(log => log.amount),
        color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <LinearGradient
          colors={getProgressColor()}
          style={styles.progressCircle}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.progressText}>{todayTotal}</Text>
            <Text style={styles.progressSubtext}>ml</Text>
          </View>
        </LinearGradient>
        <View style={styles.goalContainer}>
          {isEditingGoal ? (
            <View style={styles.goalEditContainer}>
              <TextInput
                style={styles.goalInput}
                keyboardType="number-pad"
                value={newGoal}
                onChangeText={setNewGoal}
                placeholder="Enter new goal"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveGoal}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.goalTextContainer}
              onPress={() => setIsEditingGoal(true)}
            >
              <Text style={styles.goalText}>Daily Goal: {dailyGoal}ml</Text>
              <Ionicons name="pencil" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Today's Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>Today's Water Intake</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#6B8CFF',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.logsList}>
          {waterLogs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logInfo}>
                <Ionicons name="water-outline" size={24} color="#6B8CFF" />
                <View style={styles.logTexts}>
                  <Text style={styles.logAmount}>{log.amount}ml</Text>
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                </View>
              </View>
              <Text style={styles.logProgress}>
                {((log.amount / dailyGoal) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSubtext: {
    fontSize: 16,
    color: '#666',
  },
  goalContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalText: {
    fontSize: 16,
    color: '#666',
  },
  goalEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: 120,
  },
  saveButton: {
    backgroundColor: '#6B8CFF',
    padding: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  logsList: {
    gap: 12,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logTexts: {
    gap: 4,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  logProgress: {
    fontSize: 14,
    color: '#6B8CFF',
    fontWeight: 'bold',
  },
});
