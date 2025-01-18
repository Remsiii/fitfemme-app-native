import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

// 2025 Modern Color Scheme
const colors = {
  background: '#FFFFFF',
  primary: '#7000FF',
  secondary: '#00E5FF',
  accent: '#FF3D71',
  success: '#00E096',
  text: '#2E3A59',
  textLight: '#8F9BB3',
  card: '#F7F9FC'
};

const todayData = {
  steps: {
    current: 6842,
    goal: 10000,
    unit: 'Schritte'
  },
  activeEnergy: {
    current: 286,
    goal: 400,
    unit: 'kcal'
  },
  exerciseTime: {
    current: 22,
    goal: 30,
    unit: 'Min'
  }
};

const weeklyActivity = [
  { day: 'Mo', steps: 7523, calories: 320 },
  { day: 'Di', steps: 8234, calories: 345 },
  { day: 'Mi', steps: 6932, calories: 298 },
  { day: 'Do', steps: 9123, calories: 387 },
  { day: 'Fr', steps: 6842, calories: 286 },
  { day: 'Sa', steps: 0, calories: 0 },
  { day: 'So', steps: 0, calories: 0 }
];

const CircularProgress = ({ progress, size, color, strokeWidth = 10, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={color + '20'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        {children}
      </View>
    </View>
  );
};

const MetricCard = ({ icon, title, value, color }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

export default function HealthTracker() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Fitness',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Aktivitäten</Text>
          
          {/* Main Progress */}
          <View style={styles.mainProgress}>
            <CircularProgress
              progress={todayData.steps.current / todayData.steps.goal}
              size={200}
              color={colors.primary}
              strokeWidth={15}
            >
              <Text style={styles.progressValue}>{todayData.steps.current}</Text>
              <Text style={styles.progressLabel}>Schritte</Text>
            </CircularProgress>
          </View>

          {/* Metrics */}
          <View style={styles.metrics}>
            <MetricCard
              icon="footsteps"
              title="Schritte"
              value={`${Math.round((todayData.steps.current / todayData.steps.goal) * 100)}%`}
              color={colors.primary}
            />
            <MetricCard
              icon="flame"
              title="Kalorien"
              value={`${todayData.activeEnergy.current}`}
              color={colors.accent}
            />
            <MetricCard
              icon="time"
              title="Training"
              value={`${todayData.exerciseTime.current}min`}
              color={colors.success}
            />
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyCard}>
            <Text style={styles.sectionTitle}>Wochenübersicht</Text>
            <View style={styles.weeklyChart}>
              {weeklyActivity.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={[colors.primary + '40', colors.primary]}
                      style={[
                        styles.bar,
                        { 
                          height: `${(day.steps / 10000) * 100}%`,
                          opacity: day.steps > 0 ? 1 : 0.2
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Additional Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <CircularProgress
                progress={0.72}
                size={100}
                color={colors.accent}
                strokeWidth={8}
              >
                <Text style={styles.statValue}>72</Text>
                <Text style={styles.statLabel}>BPM</Text>
              </CircularProgress>
              <Text style={styles.statTitle}>Herzfrequenz</Text>
            </View>
            <View style={styles.statCard}>
              <CircularProgress
                progress={0.65}
                size={100}
                color={colors.success}
                strokeWidth={8}
              >
                <Text style={styles.statValue}>7.2</Text>
                <Text style={styles.statLabel}>Std</Text>
              </CircularProgress>
              <Text style={styles.statTitle}>Schlaf</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
  },
  mainProgress: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressValue: {
    fontSize: 48,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  metricCard: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  weeklyCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  weeklyChart: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: 8,
    height: '85%',
    backgroundColor: colors.primary + '10',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  statTitle: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    fontWeight: '500',
  },
});
