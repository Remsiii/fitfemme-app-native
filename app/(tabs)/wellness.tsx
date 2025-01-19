import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

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
          colors={['#FF9DC4', '#FF6B9C']}
          style={styles.quoteGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.quoteIconContainer}>
            <Ionicons name="flower" size={24} color="#fff" />
          </View>
          <Text style={styles.quoteTitle}>Daily Inspiration ✨</Text>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
        </LinearGradient>
      </View>

      {/* Mood & Energy Tracking */}
      <View style={styles.card}>
        <LinearGradient
          colors={['#92A3FD', '#9DCEFF']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={24} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Self-Care Check</Text>
          </View>

          <Text style={styles.wellnessDescription}>
            Take a moment for yourself. Track your mood, energy, and thoughts 🌸
          </Text>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => setWellnessCheckVisible(true)}
          >
            <Text style={styles.checkButtonText}>Daily Check-in ✨</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Period Tracking */}
      <View style={styles.card}>
        <LinearGradient
          colors={['#FF9DC4', '#FF6B9C']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={24} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Cycle Tracking</Text>
          </View>

          <Text style={styles.wellnessDescription}>
            Track your cycle, symptoms, and get personalized insights 📅
          </Text>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => setPeriodTrackerVisible(true)}
          >
            <Text style={styles.checkButtonText}>Open Tracker 🌙</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Self-Care Tips */}
      <View style={styles.card}>
        <LinearGradient
          colors={['#92A3FD', '#9DCEFF']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={24} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Self-Care Tips</Text>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="moon" size={20} color="#fff" />
              <Text style={styles.tipText}>Get 7-9 hours of beauty sleep 😴</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={20} color="#fff" />
              <Text style={styles.tipText}>Take mindful breaks during the day 🧘‍♀️</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={styles.tipText}>Stay hydrated for glowing skin ✨</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="heart" size={20} color="#fff" />
              <Text style={styles.tipText}>Practice self-love daily 💝</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Period Tracker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={periodTrackerVisible}
        onRequestClose={() => setPeriodTrackerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cycle Tracker</Text>
              <TouchableOpacity onPress={() => setWellnessCheckVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#FF6B9C',
                todayTextColor: '#FF6B9C',
                arrowColor: '#FF6B9C',
              }}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPeriodTrackerVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Daily Check-in Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wellnessCheckVisible}
        onRequestClose={() => setWellnessCheckVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Check-in 🌸</Text>
              <TouchableOpacity onPress={() => setWellnessCheckVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
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
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  quoteCard: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quoteGradient: {
    padding: 25,
    alignItems: 'center',
  },
  quoteIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  quoteTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  quoteText: {
    color: '#fff',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 26,
  },
  quoteAuthor: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  card: {
    margin: 20,
    marginTop: 0,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  wellnessDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24,
  },
  checkButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tipsList: {
    gap: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 15,
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
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
  modalCloseButton: {
    backgroundColor: '#FF6B9C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
