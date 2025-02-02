import React, { useState, useEffect, useRef } from 'react';
import { Animated, ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

// Reusable Component mit Scaling-Animation bei Press
const AnimatedTouchable = ({ onPress, children, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scaleAnim, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function WellnessScreen() {
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });
  const [wellnessCheckVisible, setWellnessCheckVisible] = useState(false);
  const [periodTrackerVisible, setPeriodTrackerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [moodRating, setMoodRating] = useState(0);
  const [energyRating, setEnergyRating] = useState(0);
  const [sleepRating, setSleepRating] = useState(0);

  // Animation für Zitat-Card (Fade-in)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tägliches Zitat laden
    fetch('https://type.fit/api/quotes')
      .then(res => res.json())
      .then(data => {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        setDailyQuote({
          text: randomQuote.text,
          author: randomQuote.author || 'Unbekannt'
        });
      })
      .catch(() => {
        setDailyQuote({
          text: "Du bist stärker, als du denkst.",
          author: "FitFemme"
        });
      });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Skalierungsanimation für die Modals
  const periodScaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkInScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (periodTrackerVisible) {
      periodScaleAnim.setValue(0.9);
      Animated.spring(periodScaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [periodTrackerVisible]);

  useEffect(() => {
    if (wellnessCheckVisible) {
      checkInScaleAnim.setValue(0.9);
      Animated.spring(checkInScaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [wellnessCheckVisible]);

  const handleDateSelect = (day: { dateString: string; }) => {
    const date = day.dateString;
    const updatedMarkedDates = {
      ...markedDates,
      [date]: {
        selected: true,
        marked: true,
        selectedColor: '#84fab0'
      }
    };
    setSelectedDate(date);
    setMarkedDates(updatedMarkedDates);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Wellness',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />

      {/* Zitat des Tages */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.quoteCard}>
          <LinearGradient
            colors={['#a1c4fd', '#c2e9fb']}
            style={styles.quoteGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quoteContent}>
              <Text style={styles.quoteEmoji}>✨</Text>
              <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
              <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Hauptkarten Container */}
      <View style={styles.cardsContainer}>
        {/* Täglicher Check-in */}
        <AnimatedTouchable
          style={styles.mainCard}
          onPress={() => setWellnessCheckVisible(true)}
        >
          <LinearGradient
            colors={['#d4fc79', '#96e6a1']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🌸</Text>
                <Text style={styles.cardTitle}>Täglicher Check-in</Text>
              </View>
              <Text style={styles.cardDescription}>
                Verfolge deine Stimmung, Energie und Gedanken
              </Text>
            </View>
          </LinearGradient>
        </AnimatedTouchable>

        {/* Zyklus-Tracker */}
        <AnimatedTouchable
          style={styles.mainCard}
          onPress={() => setPeriodTrackerVisible(true)}
        >
          <LinearGradient
            colors={['#84fab0', '#8fd3f4']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🌙</Text>
                <Text style={styles.cardTitle}>Zyklus-Tracker</Text>
              </View>
              <Text style={styles.cardDescription}>
                Überwache deinen Zyklus und deine Symptome
              </Text>
            </View>
          </LinearGradient>
        </AnimatedTouchable>

        {/* Self-Care Tipps */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tägliche Self-Care</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>😴</Text>
              <Text style={styles.tipText}>Schönheitsschlaf</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>🧘‍♀️</Text>
              <Text style={styles.tipText}>Achtsamkeit</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💧</Text>
              <Text style={styles.tipText}>Hydration</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💝</Text>
              <Text style={styles.tipText}>Selbstliebe</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Zyklus Tracker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={periodTrackerVisible}
        onRequestClose={() => setPeriodTrackerVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: periodScaleAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zyklus Tracker</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPeriodTrackerVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={28} color="#84fab0" />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#84fab0',
                todayTextColor: '#84fab0',
                arrowColor: '#84fab0',
                monthTextColor: '#333',
                textMonthFontSize: 18,
                textMonthFontWeight: '600',
                textDayFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
            />
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Täglicher Check-in Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wellnessCheckVisible}
        onRequestClose={() => setWellnessCheckVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: checkInScaleAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Täglicher Check-in 🌸</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setWellnessCheckVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={28} color="#84fab0" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Wie ist deine Stimmung heute?</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={`mood-${rating}`}
                    style={[
                      styles.ratingButton,
                      moodRating === rating && styles.ratingButtonSelected
                    ]}
                    onPress={() => setMoodRating(rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      moodRating === rating && styles.ratingButtonTextSelected
                    ]}>
                      {rating === 1 ? '😔' :
                        rating === 2 ? '😕' :
                          rating === 3 ? '😊' :
                            rating === 4 ? '😃' : '🤗'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Energielevel</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={`energy-${rating}`}
                    style={[
                      styles.ratingButton,
                      energyRating === rating && styles.ratingButtonSelected
                    ]}
                    onPress={() => setEnergyRating(rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      energyRating === rating && styles.ratingButtonTextSelected
                    ]}>
                      {rating === 1 ? '🔋' :
                        rating === 2 ? '🔋🔋' :
                          rating === 3 ? '🔋🔋🔋' :
                            rating === 4 ? '🔋🔋🔋🔋' : '🔋🔋🔋🔋🔋'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Schlafqualität</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={`sleep-${rating}`}
                    style={[
                      styles.ratingButton,
                      sleepRating === rating && styles.ratingButtonSelected
                    ]}
                    onPress={() => setSleepRating(rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      sleepRating === rating && styles.ratingButtonTextSelected
                    ]}>
                      {rating === 1 ? '😴' :
                        rating === 2 ? '😴😴' :
                          rating === 3 ? '😴😴😴' :
                            rating === 4 ? '😴😴😴😴' : '😴😴😴😴😴'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                setWellnessCheckVisible(false);
                setMoodRating(0);
                setEnergyRating(0);
                setSleepRating(0);
              }}
            >
              <LinearGradient
                colors={['#f6d365', '#fda085']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitButtonText}>Check-in speichern ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  quoteCard: {
    margin: 16,
    marginTop: 44,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  quoteGradient: {
    borderRadius: 24,
    padding: 20,
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteEmoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  cardsContainer: {
    padding: 16,
  },
  mainCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardGradient: {
    borderRadius: 24,
    padding: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipCard: {
    width: (cardWidth - 16) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tipEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  modalContent: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  ratingSection: {
    marginBottom: 25,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#84fab0',
  },
  ratingButtonText: {
    fontSize: 20,
  },
  ratingButtonTextSelected: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

