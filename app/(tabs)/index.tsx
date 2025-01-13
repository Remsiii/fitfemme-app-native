import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../../context/SettingsContext';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { hapticEnabled } = useSettings();

  const triggerHaptic = async () => {
    if (!hapticEnabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.debug('Haptics not available on this platform');
    }
  };

  const heartRateData = {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [65, 70, 80, 75, 85, 78],
      color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const workoutProgress = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50],
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.userName}>Daniel</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={triggerHaptic}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#6B8CFF', '#B4C4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bmiCard}
      >
        <View>
          <Text style={styles.bmiTitle}>BMI (Body Mass Index)</Text>
          <Text style={styles.bmiSubtitle}>You have a normal weight</Text>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={triggerHaptic}
          >
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bmiCircle}>
          <Text style={styles.bmiValue}>20,1</Text>
        </View>
      </LinearGradient>

      <View style={styles.targetSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today Target</Text>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={triggerHaptic}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Activity Status</Text>
        <View style={styles.heartRateCard}>
          <View>
            <Text style={styles.heartRateTitle}>Heart Rate</Text>
            <Text style={styles.heartRateValue}>78 BPM</Text>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={heartRateData}
              width={screenWidth - 80}
              height={100}
              chartConfig={{
                backgroundGradientFrom: '#F5F7FF',
                backgroundGradientTo: '#F5F7FF',
                decimalPlaces: 0,
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
            <Text style={styles.timeText}>3mins ago</Text>
          </View>
        </View>

        <View style={styles.waterIntakeCard}>
          <View style={styles.waterHeader}>
            <Text style={styles.waterTitle}>Water Intake</Text>
            <Text style={styles.waterValue}>4 Liters</Text>
          </View>
          <Text style={styles.waterSubtitle}>Real time updates</Text>
          <View style={styles.waterTimeline}>
            {[
              { time: '6am - 8am', amount: '600ml' },
              { time: '9am - 11am', amount: '500ml' },
              { time: '11am - 2pm', amount: '1000ml' },
              { time: '2pm - 4pm', amount: '700ml' },
              { time: '4pm - now', amount: '900ml' },
            ].map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.timelineTime}>{item.time}</Text>
                <Text style={styles.timelineAmount}>{item.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesTitle}>Calories</Text>
          <View style={styles.caloriesContent}>
            <Text style={styles.caloriesValue}>760 kCal</Text>
            <Text style={styles.caloriesRemaining}>2300Cal left</Text>
          </View>
        </View>
      </View>

      <View style={styles.workoutSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout Progress</Text>
          <TouchableOpacity onPress={triggerHaptic}>
            <Text style={styles.weeklyText}>Weekly</Text>
          </TouchableOpacity>
        </View>
        <LineChart
          data={workoutProgress}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(107, 140, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.workoutChart}
        />
      </View>

      <View style={styles.latestWorkoutSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Workout</Text>
          <TouchableOpacity onPress={triggerHaptic}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {[
          {
            title: 'Fullbody Workout',
            duration: '180 Calories Burn | 20minutes',
            image: require('../../assets/images/google.png')
          },
          {
            title: 'Lowerbody Workout',
            duration: '200 Calories Burn | 30minutes',
            image: require('../../assets/images/google.png')
          },
          {
            title: 'Ab Workout',
            duration: '150 Calories Burn | 15minutes',
            image: require('../../assets/images/google.png')
          },
        ].map((workout, index) => (
          <TouchableOpacity
            key={index}
            style={styles.workoutCard}
            onPress={triggerHaptic}
          >
            <Image source={workout.image} style={styles.workoutImage} />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <Text style={styles.workoutDuration}>{workout.duration}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiCard: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bmiSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 16,
  },
  viewMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 14,
  },
  bmiCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8CFF',
  },
  targetSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  checkButton: {
    backgroundColor: '#6B8CFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  activitySection: {
    padding: 16,
  },
  heartRateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  heartRateTitle: {
    fontSize: 16,
    color: '#666',
  },
  heartRateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8CFF',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 16,
  },
  chart: {
    borderRadius: 16,
  },
  timeIndicator: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#B4C4FF',
  },
  waterIntakeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 16,
    color: '#666',
  },
  waterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B8CFF',
  },
  waterSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  waterTimeline: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timelineTime: {
    fontSize: 14,
    color: '#666',
  },
  timelineAmount: {
    fontSize: 14,
    color: '#6B8CFF',
  },
  caloriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  caloriesTitle: {
    fontSize: 16,
    color: '#666',
  },
  caloriesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
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
  workoutSection: {
    padding: 16,
  },
  weeklyText: {
    fontSize: 14,
    color: '#6B8CFF',
  },
  workoutChart: {
    marginTop: 16,
    borderRadius: 16,
  },
  latestWorkoutSection: {
    padding: 16,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#6B8CFF',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  workoutImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  workoutDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen;