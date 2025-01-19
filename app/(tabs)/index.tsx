import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import {
  LinearGradient
} from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { hapticEnabled } = useSettings();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar_url: string;
    age: string | number;
    weight: string | number;
    height: string | number;
    goal: string;
  }>({
    name: "New User",
    email: "",
    avatar_url: "",
    age: "N/A",
    weight: "N/A",
    height: "N/A",
    goal: "No specific goal"
  });

  // -------------------------------------
  // STATES
  // -------------------------------------
  const [heartRate, setHeartRate] = useState<number>(75);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>(Array(30).fill(75));
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [waterAmount, setWaterAmount] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [wellnessCheckVisible, setWellnessCheckVisible] = useState(false);
  const [wellnessResponses, setWellnessResponses] = useState({
    mood: 0,
    energy: 0,
    sleep: 0,
  });
  const [lastWaterIntakeDate, setLastWaterIntakeDate] = useState<string>('');
  const [showWaterReminder, setShowWaterReminder] = useState(false);
  const router = useRouter();

  // Function to get relative time string
  const getRelativeTimeString = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser?.user) {
        router.replace("/login");
        throw new Error("User is not authenticated");
      }

      const userId = authUser.user.id;

      const { data: profileData, error: dbError } = await supabase
        .from("users")
        .select("full_name, email, profile_picture_url, age, weight, height, goal")
        .eq("id", userId)
        .maybeSingle();

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      if (profileData) {
        setProfile({
          name: profileData.full_name || "New User",
          email: profileData.email || "",
          avatar_url: profileData.profile_picture_url || "",
          age: profileData.age || "N/A",
          weight: profileData.weight || "N/A",
          height: profileData.height || "N/A",
          goal: profileData.goal || "No specific goal"
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(
        "Error",
        "Could not load profile. Please try again."
      );
    }
  };

  // Fetch user activities
  const fetchUserActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_activities')
        .select('water_intake_ml, heart_rate')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching activities:', error);
        return;
      }

      if (data) {
        setWaterIntake(data.water_intake_ml || 0);
        if (data.heart_rate) {
          setHeartRate(data.heart_rate);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch today's workout
  const fetchTodayWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          *,
          workout:workouts (
            id,
            name,
            type,
            duration,
            difficulty,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today\'s workout:', error);
        return;
      }

      setTodayWorkout(data?.workout || null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Check water intake
  const checkWaterIntake = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking water intake:', error);
        return;
      }

      if (data) {
        const lastIntakeDate = new Date(data.created_at).toISOString().split('T')[0];
        setLastWaterIntakeDate(lastIntakeDate);
        setShowWaterReminder(lastIntakeDate !== today);
      } else {
        setShowWaterReminder(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Update water intake
  const handleAddWater = async () => {
    try {
      const amount = parseInt(waterAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid water amount');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: existingEntry } = await supabase
        .from('user_activities')
        .select('id, water_intake_ml')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single();

      if (existingEntry) {
        const newTotal = (existingEntry.water_intake_ml || 0) + amount;
        const { error } = await supabase
          .from('user_activities')
          .update({ water_intake_ml: newTotal })
          .eq('id', existingEntry.id);

        if (error) throw error;
        setWaterIntake(newTotal);
      } else {
        const { error } = await supabase
          .from('user_activities')
          .insert([
            {
              user_id: user.id,
              activity_date: today,
              water_intake_ml: amount,
              heart_rate: heartRate
            }
          ]);

        if (error) throw error;
        setWaterIntake(amount);
      }

      setWaterAmount('');
      setShowWaterModal(false);
      triggerHaptic();
      Alert.alert('Success', 'Water intake updated successfully');
    } catch (error) {
      console.error('Error updating water intake:', error);
      Alert.alert('Error', 'Failed to update water intake');
    }
  };

  // Simulate natural heart rate changes
  useEffect(() => {
    const updateHeartRate = () => {
      setHeartRate(prevRate => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newRate = Math.min(100, Math.max(60, prevRate + change));

        // Update history array
        setHeartRateHistory(prev => [...prev.slice(1), newRate]);

        return newRate;
      });
      setLastUpdate(new Date());
    };

    // Update every 3 seconds
    const interval = setInterval(updateHeartRate, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUserActivities();
    fetchTodayWorkout();
    checkWaterIntake();
  }, []);

  // -------------------------------------
  // HAPTICS (Vibration)
  // -------------------------------------
  const triggerHaptic = async () => {
    if (!hapticEnabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.debug('Haptics nicht verfügbar auf dieser Plattform');
    }
  };

  // -------------------------------------
  // DATEN FÜR DIE CHARTS
  // -------------------------------------
  const heartRateData = {
    labels: Array(30).fill(''),
    datasets: [
      {
        data: heartRateHistory,
        color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const workoutProgress = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
      },
    ],
  };

  // Handle wellness check
  const handleWellnessCheck = () => {
    setWellnessCheckVisible(true);
  };

  // Submit wellness check
  const submitWellnessCheck = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('wellness_checks')
        .insert([
          {
            user_id: user.id,
            check_date: today,
            mood_rating: wellnessResponses.mood,
            energy_rating: wellnessResponses.energy,
            sleep_rating: wellnessResponses.sleep
          }
        ]);

      if (error) throw error;

      setWellnessCheckVisible(false);
      triggerHaptic();
      Alert.alert('Success', 'Thank you for checking in! 🌸');
    } catch (error) {
      console.error('Error saving wellness check:', error);
      Alert.alert('Error', 'Failed to save wellness check');
    }
  };

  // -------------------------------------
  // RETURN: UI
  // -------------------------------------
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.userName}>{profile.name}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={triggerHaptic}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* TODAY TARGET */}
      <View style={styles.targetSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today Target</Text>
        </View>

        <View style={styles.targetContent}>
          {todayWorkout && (
            <TouchableOpacity 
              style={styles.todayWorkoutCard}
              onPress={() => router.push(`/workout/${todayWorkout.id}`)}
            >
              <LinearGradient
                colors={['#92A3FD', '#9DCEFF']}
                style={styles.workoutCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {todayWorkout.icon && (
                  <Image 
                    source={{ uri: todayWorkout.icon }}
                    style={styles.workoutCardImage}
                  />
                )}
                <View style={styles.workoutCardContent}>
                  <Text style={styles.workoutCardTitle}>{todayWorkout.name}</Text>
                  <Text style={styles.workoutCardDetails}>
                    {todayWorkout.duration} min • {todayWorkout.difficulty}
                  </Text>
                </View>
                <View style={styles.workoutCardAction}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.reminderCard}
            onPress={() => router.push('/wellness')}
          >
            <LinearGradient
              colors={['#FF9DC4', '#FF6B9C']}
              style={styles.reminderCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.reminderIconContainer}>
                <Ionicons name="flower" size={24} color="#fff" />
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>Track Your Wellness 🌸</Text>
                <Text style={styles.reminderText}>
                  Check your daily wellness and stay hydrated!
                </Text>
              </View>
              <View style={styles.reminderAction}>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTIVITY STATUS */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Activity Status</Text>

        {/* Herzfrequenz-CARD */}
        <View style={styles.heartRateCard}>
          <View>
            <Text style={styles.heartRateValue}>{heartRate} BPM</Text>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={heartRateData}
              width={screenWidth - 80}
              height={100}
              chartConfig={{
                decimalPlaces: 0,
                backgroundGradientFrom: '#F5F7FF',
                backgroundGradientTo: '#F5F7FF',
                color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
            />
          </View>

          <View style={styles.timeIndicator}>
            <Text style={styles.timeText}>
              Last updated {getRelativeTimeString(lastUpdate)}
            </Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {/* Water Intake Tracker */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/water-tracker')}
            >
              <LinearGradient
                colors={['#6B8CFF', '#4B6FE0']}
                style={styles.iconContainer}
              >
                <Ionicons name="water-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Water Intake</Text>
              <Text style={styles.quickActionValue}>{waterIntake} ml</Text>
            </TouchableOpacity>

            {/* Period Tracker */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/period-tracker')}
            >
              <LinearGradient
                colors={['#FF6B8C', '#E04B6F']}
                style={styles.iconContainer}
              >
                <Ionicons name="calendar-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Period Tracker</Text>
              <Text style={styles.quickActionSubtext}>Track your cycle</Text>
            </TouchableOpacity>

            {/* BMI Score */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/bmi-calculator')}
            >
              <LinearGradient
                colors={['#6BCF91', '#4BA36E']}
                style={styles.iconContainer}
              >
                <Ionicons name="stats-chart-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>BMI Score</Text>
              <Text style={styles.quickActionValue}>
                {profile.weight && profile.height
                  ? (Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)).toFixed(1)
                  : 'Calculate'}
              </Text>
            </TouchableOpacity>

            {/* Health Tracker */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/health-tracker')}
            >
              <LinearGradient
                colors={['#FFB86B', '#E09B4B']}
                style={styles.iconContainer}
              >
                <Ionicons name="fitness-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Health Tracker</Text>
              <Text style={styles.quickActionSubtext}>Monitor vitals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Water Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showWaterModal}
        onRequestClose={() => setShowWaterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Water Intake</Text>
            <TextInput
              style={styles.waterInput}
              keyboardType="number-pad"
              placeholder="Enter amount in ml"
              value={waterAmount}
              onChangeText={setWaterAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWaterModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddWater}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// -------------------------------------
// STYLES
// -------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    paddingTop: 50,
  },
  header: {
    height: 200,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    backgroundColor: '#F5F7FF',
    padding: 10,
    borderRadius: 10,
  },
  targetSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  targetContent: {
    marginTop: 15,
    gap: 15,
  },
  todayWorkoutCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  workoutCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  workoutCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  workoutCardDetails: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  workoutCardAction: {
    padding: 10,
  },
  reminderCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reminderCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  reminderIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  reminderText: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  reminderAction: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontWeight: '500',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#FF9DC4',
  },
  ratingButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  ratingButtonTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF9DC4',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FF9DC4',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  modalSubmitButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activitySection: {
    padding: 16,
  },
  heartRateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  heartRateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8CFF',
  },
  chartContainer: {
    marginTop: 16,
  },
  chart: {
    borderRadius: 16,
  },
  timeIndicator: {
    marginTop: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8CFF',
    marginTop: 10,
  },
  statsSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  caloriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  caloriesTitle: {
    fontSize: 16,
    color: '#333',
  },
  caloriesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8CFF',
  },
  caloriesRemaining: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsSection: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickActionValue: {
    fontSize: 16,
    color: '#6B8CFF',
    fontWeight: '600',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  waterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  addButton: {
    backgroundColor: '#6B8CFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
