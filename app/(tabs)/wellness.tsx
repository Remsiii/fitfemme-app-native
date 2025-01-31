import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

export default function WellnessScreen() {
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });
  const [wellnessCheckVisible, setWellnessCheckVisible] = useState(false);
  const [periodTrackerVisible, setPeriodTrackerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [moodRating, setMoodRating] = useState(0);
  const [energyRating, setEnergyRating] = useState(0);
  const [sleepRating, setSleepRating] = useState(0);

  // Fetch daily quote
  useEffect(() => {
    fetch('https://type.fit/api/quotes')
      .then(res => res.json())
      .then(data => {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        setDailyQuote({
          text: randomQuote.text,
          author: randomQuote.author || 'Unknown'
        });
      })
      .catch(() => {
        setDailyQuote({
          text: "You are stronger than you know.",
          author: "FitFemme"
        });
      });
  }, []);

  const handleDateSelect = (day: { dateString: any; }) => {
    const date = day.dateString;
    const updatedMarkedDates = {
      ...markedDates,
      [date]: {
        selected: true,
        marked: true,
        selectedColor: '#FF6B9C'
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

      {/* Quote of the Day */}
      <View style={styles.quoteCard}>
        <LinearGradient
          colors={['#FFE1EC', '#FFF0F5']}
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

      {/* Main Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Mood & Energy Tracking */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => setWellnessCheckVisible(true)}
        >
          <LinearGradient
            colors={['#FFF0F5', '#FFE1EC']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🌸</Text>
                <Text style={styles.cardTitle}>Daily Check-in</Text>
              </View>
              <Text style={styles.cardDescription}>
                Track your mood, energy, and thoughts
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Period Tracking */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => setPeriodTrackerVisible(true)}
        >
          <LinearGradient
            colors={['#FFE1EC', '#FFF0F5']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🌙</Text>
                <Text style={styles.cardTitle}>Cycle Tracking</Text>
              </View>
              <Text style={styles.cardDescription}>
                Monitor your cycle and symptoms
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Self-Care Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Daily Self-Care</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>😴</Text>
              <Text style={styles.tipText}>Beauty Sleep</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>🧘‍♀️</Text>
              <Text style={styles.tipText}>Mindfulness</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💧</Text>
              <Text style={styles.tipText}>Hydration</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💝</Text>
              <Text style={styles.tipText}>Self-Love</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Period Tracker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={periodTrackerVisible}
        onRequestClose={() => setPeriodTrackerVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cycle Tracker</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPeriodTrackerVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={28} color="#FF6B9C" />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#FF6B9C',
                todayTextColor: '#FF6B9C',
                arrowColor: '#FF6B9C',
                monthTextColor: '#333',
                textMonthFontSize: 18,
                textMonthFontWeight: '600',
                textDayFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>
        </BlurView>
      </Modal>

      {/* Daily Check-in Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wellnessCheckVisible}
        onRequestClose={() => setWellnessCheckVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Check-in 🌸</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setWellnessCheckVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={28} color="#FF6B9C" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>How's your mood today?</Text>
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
              <Text style={styles.ratingTitle}>Energy Level</Text>
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
              <Text style={styles.ratingTitle}>Sleep Quality</Text>
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
                colors={['#FF9DC4', '#FF6B9C']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitButtonText}>Save Check-in ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    ...Platform.select({
      ios: {
        shadowColor: '#FFB6C1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    padding: 20,
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
    ...Platform.select({
      ios: {
        shadowColor: '#FFB6C1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
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
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFB6C1',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalContent: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
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
    backgroundColor: '#FF9DC4',
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
