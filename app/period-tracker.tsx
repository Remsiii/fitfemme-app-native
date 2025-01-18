import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../lib/supabase';

// Menstrual cycle phases (typical lengths)
const PHASES = {
  MENSTRUAL: { name: 'Menstruation', length: 5, color: '#FF69B4' },
  FOLLICULAR: { name: 'Follikelphase', length: 9, color: '#4ECDC4' },
  OVULATION: { name: 'Ovulation', length: 5, color: '#FFD93D' },
  LUTEAL: { name: 'Lutealphase', length: 9, color: '#6C5CE7' }
};

// Calculate total cycle length
const CYCLE_LENGTH = Object.values(PHASES).reduce((sum, phase) => sum + phase.length, 0);

interface PeriodData {
  id: string;
  user_id: string;
  period_start_date: string;
  period_end_date: string | null;
  cycle_length: number;
  period_length: number;
  symptoms: string[];
  notes: string;
}

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export default function PeriodTracker() {
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [markedDates, setMarkedDates] = useState({});
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    fetchPeriodData();
  }, []);

  const fetchPeriodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('period_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('period_start_date', { ascending: false });

      if (error) throw error;
      if (data) {
        setPeriodData(data);
        calculatePhases(data[0]);
      }
    } catch (error) {
      console.error('Error fetching period data:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = MONTHS_DE[date.getMonth()];
    const year = date.getFullYear();
    return `${day}. ${month} ${year}`;
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const differenceInDays = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculatePhases = (lastPeriod: PeriodData) => {
    if (!lastPeriod) return;

    const startDate = new Date(lastPeriod.period_start_date);
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);
    const cycleDay = daysSinceStart % CYCLE_LENGTH;

    // Calculate current phase
    let daysCount = 0;
    for (const [phase, details] of Object.entries(PHASES)) {
      if (cycleDay >= daysCount && cycleDay < daysCount + details.length) {
        setCurrentPhase(phase);
        break;
      }
      daysCount += details.length;
    }

    // Calculate next period
    const nextPeriodDate = addDays(startDate, CYCLE_LENGTH);
    setNextPeriod(formatDate(nextPeriodDate));

    // Mark calendar dates
    const marks = {};
    let currentDate = startDate;
    daysCount = 0;

    for (const [phase, details] of Object.entries(PHASES)) {
      for (let i = 0; i < details.length; i++) {
        const markDate = addDays(currentDate, daysCount + i);
        const dateString = markDate.toISOString().split('T')[0];
        marks[dateString] = {
          marked: true,
          dotColor: details.color,
          selectedColor: details.color
        };
      }
      daysCount += details.length;
    }

    setMarkedDates(marks);
  };

  const getPhaseColor = (phase: string) => {
    return PHASES[phase]?.color || '#000000';
  };

  const PhaseIndicator = ({ phase, isActive }) => (
    <View style={styles.phaseIndicator}>
      <View style={[
        styles.phaseCircle,
        { backgroundColor: getPhaseColor(phase) },
        isActive && styles.activePhase
      ]} />
      <Text style={[
        styles.phaseText,
        isActive && styles.activePhaseText
      ]}>
        {PHASES[phase].name}
      </Text>
    </View>
  );

  const addNewPeriod = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Default period length is 5 days
      const endDate = addDays(selectedDate, 5);
      
      const { data, error } = await supabase
        .from('period_tracking')
        .insert([
          {
            user_id: user.id,
            period_start_date: selectedDate.toISOString().split('T')[0],
            period_end_date: endDate.toISOString().split('T')[0],
            cycle_length: CYCLE_LENGTH,
            period_length: 5,
            symptoms: symptoms,
            notes: ''
          }
        ]);

      if (error) throw error;

      setShowAddPeriod(false);
      setSymptoms([]);
      fetchPeriodData(); // Refresh data
    } catch (error) {
      console.error('Error adding period:', error);
    }
  };

  const SYMPTOMS_LIST = [
    'Krämpfe', 'Kopfschmerzen', 'Müdigkeit', 
    'Stimmungsschwankungen', 'Blähungen', 'Rückenschmerzen'
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Periodenzyklus',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Last Period Card */}
          {periodData.length > 0 && (
            <View style={styles.lastPeriodCard}>
              <Text style={styles.cardTitle}>Letzte Periode</Text>
              <Text style={styles.lastPeriodDate}>
                {formatDate(new Date(periodData[0].period_start_date))}
              </Text>
              {periodData[0].symptoms?.length > 0 && (
                <View style={styles.symptomsContainer}>
                  <Text style={styles.symptomsTitle}>Symptome:</Text>
                  <View style={styles.symptomsList}>
                    {periodData[0].symptoms.map((symptom, index) => (
                      <View key={index} style={styles.symptomTag}>
                        <Text style={styles.symptomText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Current Phase Card */}
          <View style={styles.phaseCard}>
            <Text style={styles.cardTitle}>Aktuelle Phase</Text>
            <View style={styles.phaseIndicators}>
              {Object.keys(PHASES).map((phase) => (
                <PhaseIndicator
                  key={phase}
                  phase={phase}
                  isActive={phase === currentPhase}
                />
              ))}
            </View>
          </View>

          {/* Next Period Card */}
          <View style={styles.predictionCard}>
            <LinearGradient
              colors={['#FF69B4', '#FF8DA1']}
              style={styles.predictionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.predictionContent}>
                <Ionicons name="calendar" size={24} color="#fff" />
                <Text style={styles.predictionTitle}>Nächste Periode</Text>
                <Text style={styles.predictionDate}>{nextPeriod}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Calendar */}
          <View style={styles.calendarCard}>
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => {
                if (showAddPeriod) {
                  setSelectedDate(new Date(day.dateString));
                }
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#FF69B4',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#FF69B4',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#FF69B4',
                selectedDotColor: '#ffffff',
                arrowColor: '#FF69B4',
                monthTextColor: '#2d4150',
                indicatorColor: '#FF69B4',
              }}
            />
          </View>

          {/* Add Period Modal */}
          {showAddPeriod && (
            <View style={styles.addPeriodModal}>
              <Text style={styles.modalTitle}>Neue Periode hinzufügen</Text>
              <Text style={styles.dateLabel}>Startdatum:</Text>
              <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>
              
              <Text style={styles.symptomsLabel}>Symptome:</Text>
              <View style={styles.symptomsGrid}>
                {SYMPTOMS_LIST.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomButton,
                      symptoms.includes(symptom) && styles.symptomButtonActive
                    ]}
                    onPress={() => {
                      if (symptoms.includes(symptom)) {
                        setSymptoms(symptoms.filter(s => s !== symptom));
                      } else {
                        setSymptoms([...symptoms, symptom]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.symptomButtonText,
                      symptoms.includes(symptom) && styles.symptomButtonTextActive
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddPeriod(false)}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addNewPeriod}
                >
                  <Text style={styles.saveButtonText}>Speichern</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Add Period Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setSelectedDate(new Date());
              setShowAddPeriod(true);
            }}
          >
            <LinearGradient
              colors={['#FF69B4', '#FF8DA1']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>+ Periode hinzufügen</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d4150',
    marginBottom: 20,
  },
  phaseIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  phaseIndicator: {
    alignItems: 'center',
    width: '25%',
  },
  phaseCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  activePhase: {
    transform: [{ scale: 1.2 }],
  },
  phaseText: {
    fontSize: 12,
    color: '#8F9BB3',
    textAlign: 'center',
  },
  activePhaseText: {
    color: '#2d4150',
    fontWeight: '500',
  },
  predictionCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  predictionGradient: {
    padding: 20,
  },
  predictionContent: {
    alignItems: 'center',
  },
  predictionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  predictionDate: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 5,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
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
  addButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastPeriodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  lastPeriodDate: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF69B4',
    marginTop: 10,
  },
  symptomsContainer: {
    marginTop: 15,
  },
  symptomsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d4150',
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: '#FFE4E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  symptomText: {
    color: '#FF69B4',
    fontSize: 14,
  },
  addPeriodModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d4150',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 8,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FF69B4',
    marginBottom: 20,
  },
  symptomsLabel: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 12,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  symptomButton: {
    borderWidth: 1,
    borderColor: '#FF69B4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  symptomButtonActive: {
    backgroundColor: '#FF69B4',
  },
  symptomButtonText: {
    color: '#FF69B4',
    fontSize: 14,
  },
  symptomButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8F9BB3',
  },
  cancelButtonText: {
    color: '#8F9BB3',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
