import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const screenWidth = Dimensions.get('window').width;

interface BMICategory {
  range: string;
  description: string;
  color: string;
  advice: string;
  healthRisks: string[];
  recommendations: string[];
}

const BMI_CATEGORIES: { [key: string]: BMICategory } = {
  underweight: {
    range: '< 18.5',
    description: 'Untergewicht',
    color: '#FFB156',
    advice: 'Konsultiere einen Arzt für gesunde Gewichtszunahme-Strategien.',
    healthRisks: [
      'Schwaches Immunsystem',
      'Nährstoffmangel',
      'Osteoporose-Risiko',
      'Unregelmäßige Menstruation',
      'Fruchtbarkeitsprobleme',
      'Eisenmangel-Anämie'
    ],
    recommendations: [
      'Erhöhe die Kalorienaufnahme mit nährstoffreichen Lebensmitteln',
      'Integriere gesunde Fette (Avocados, Nüsse, Olivenöl)',
      'Proteinreiche Ernährung für Muskelaufbau',
      'Krafttraining für Knochengesundheit',
      'Regelmäßige kleine Mahlzeiten',
      'Eisenreiche Lebensmittel'
    ]
  },
  normal: {
    range: '18.5 - 24.9',
    description: 'Normalgewicht',
    color: '#4CAF50',
    advice: 'Behalte deinen gesunden Lebensstil bei.',
    healthRisks: [
      'Minimale gesundheitliche Risiken',
      'Fokus auf Erhaltung der Gesundheit'
    ],
    recommendations: [
      'Regelmäßige Bewegung (150 Min/Woche)',
      'Ausgewogene Ernährung mit viel Gemüse',
      'Regelmäßige Vorsorgeuntersuchungen',
      'Ausreichend Schlaf (7-9 Stunden)',
      'Stressmanagement durch Yoga oder Meditation',
      'Calcium-reiche Ernährung für Knochengesundheit'
    ]
  },
  overweight: {
    range: '25 - 29.9',
    description: 'Übergewicht',
    color: '#FF9800',
    advice: 'Fokussiere auf ausgewogene Ernährung und mehr Bewegung.',
    healthRisks: [
      'Erhöhtes Risiko für Herz-Kreislauf-Erkrankungen',
      'PCOS (Polyzystisches Ovarialsyndrom)',
      'Schwangerschaftskomplikationen',
      'Typ-2-Diabetes-Risiko',
      'Gelenkprobleme',
      'Hormonelle Ungleichgewichte'
    ],
    recommendations: [
      'Moderate Kalorienreduktion',
      'Regelmäßiges Cardio-Training',
      'Portionskontrolle',
      'Stressmanagement',
      'Hormoncheck beim Frauenarzt',
      'Ausreichend Wassertrinken'
    ]
  },
  obese: {
    range: '≥ 30',
    description: 'Adipositas',
    color: '#F44336',
    advice: 'Suche professionelle Unterstützung für ein gesundes Gewichtsmanagement.',
    healthRisks: [
      'Erhöhtes Brustkrebsrisiko',
      'Fruchtbarkeitsprobleme',
      'Schwangerschaftskomplikationen',
      'Herz-Kreislauf-Erkrankungen',
      'Schlafapnoe',
      'Depression und Angstzustände'
    ],
    recommendations: [
      'Ärztliche Beratung',
      'Strukturiertes Gewichtsmanagement',
      'Psychologische Unterstützung wenn nötig',
      'Regelmäßige Bewegung',
      'Hormonelle Abklärung',
      'Ernährungsberatung'
    ]
  },
};

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('height, weight')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setHeight(data.height.toString());
        setWeight(data.weight.toString());
        calculateBMI(data.height, data.weight);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBMI = (h: number, w: number) => {
    const heightInM = h / 100;
    if (heightInM > 0 && w > 0) {
      const bmiValue = w / (heightInM * heightInM);
      setBMI(parseFloat(bmiValue.toFixed(1)));
    }
  };

  const updateUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({
          height: parseFloat(height),
          weight: parseFloat(weight)
        })
        .eq('id', user.id);

      if (error) throw error;

      calculateBMI(parseFloat(height), parseFloat(weight));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const getBMICategory = (bmiValue: number): BMICategory => {
    if (bmiValue < 18.5) return BMI_CATEGORIES.underweight;
    if (bmiValue < 25) return BMI_CATEGORIES.normal;
    if (bmiValue < 30) return BMI_CATEGORIES.overweight;
    return BMI_CATEGORIES.obese;
  };

  const getScalePosition = (bmiValue: number): string => {
    const position = ((bmiValue - 15) / 20) * 100;
    return `${Math.min(Math.max(position, 0), 100)}%`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B8CFF" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
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
          title: 'BMI Calculator',
          headerStyle: { backgroundColor: '#f5f5f5' },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {bmi !== null && !isEditing && (
            <LinearGradient
              colors={[getBMICategory(bmi).color, getBMICategory(bmi).color + '80']}
              style={styles.resultCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bmiCircle}>
                <Text style={styles.bmiValue}>{bmi}</Text>
                <Text style={styles.bmiLabel}>BMI</Text>
              </View>
              <Text style={styles.categoryText}>
                {getBMICategory(bmi).description}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Update Measurements</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {isEditing && (
            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>Update Measurements</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="65"
                  />
                </View>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={updateUserData}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {bmi !== null && (
            <>
              <View style={styles.scaleCard}>
                <Text style={styles.sectionTitle}>BMI Scale</Text>
                <View style={styles.scaleContainer}>
                  <View style={styles.scaleBar}>
                    {Object.values(BMI_CATEGORIES).map((category, index) => (
                      <View
                        key={index}
                        style={[
                          styles.scaleSegment,
                          { backgroundColor: category.color }
                        ]}
                      />
                    ))}
                    <View 
                      style={[
                        styles.indicator,
                        { left: getScalePosition(bmi) }
                      ]}
                    />
                  </View>
                  <View style={styles.scaleLabels}>
                    {Object.values(BMI_CATEGORIES).map((category, index) => (
                      <Text key={index} style={styles.scaleLabel}>
                        {category.range}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.healthCard}>
                <Text style={styles.sectionTitle}>Health Information</Text>
                <View style={styles.healthSection}>
                  <Text style={styles.healthTitle}>Potential Health Risks</Text>
                  {getBMICategory(bmi).healthRisks.map((risk, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="alert-circle" size={20} color={getBMICategory(bmi).color} />
                      <Text style={styles.listText}>{risk}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.healthSection}>
                  <Text style={styles.healthTitle}>Recommendations</Text>
                  {getBMICategory(bmi).recommendations.map((rec, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <Text style={styles.listText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Über den BMI</Text>
                <Text style={styles.infoText}>
                  Der Body Mass Index (BMI) ist ein Richtwert für das Verhältnis von Gewicht zu Körpergröße. Bei Frauen sollten zusätzliche Faktoren wie Körperbau, Alter, Muskelmasse, Schwangerschaft und hormonelle Veränderungen berücksichtigt werden. Der BMI ist ein Orientierungswert - für eine umfassende Gesundheitsbeurteilung sollten Sie Ihren Arzt konsultieren.
                </Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Mehr über BMI erfahren</Text>
                  <Ionicons name="arrow-forward" size={20} color="#6B8CFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
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
  resultCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  bmiLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  categoryText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  inputCard: {
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputContainer: {
    width: '47%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6B8CFF',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  scaleCard: {
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
  scaleContainer: {
    width: '100%',
  },
  scaleBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  scaleSegment: {
    flex: 1,
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: '#000',
    borderRadius: 2,
    top: -4,
    marginLeft: -2,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666',
  },
  healthCard: {
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
  healthSection: {
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
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
  infoText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  learnMoreText: {
    color: '#6B8CFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
