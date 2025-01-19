import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Svg, Path, Circle } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge } from '@/utils/dateUtils';

const ExerciseIllustration = () => (
    <Svg width="200" height="200" viewBox="0 0 400 400">
        {/* Background blob */}
        <Path
            d="M50,250 Q150,150 250,250 T450,250"
            fill="#A5B9FF"
            opacity="0.3"
        />
        {/* Exercise figure - simplified version */}
        <Path
            d="M200,150 Q220,140 240,150 T280,170 L260,190 Q240,200 220,190 Z"
            fill="#6B7280"
        />
        <Circle cx="260" cy="140" r="20" fill="#6B7280" />
        <Path
            d="M180,180 Q200,200 220,220 T260,240"
            fill="none"
            stroke="#6B7280"
            strokeWidth="30"
        />
    </Svg>
);

export default function ProfileSetupScreen() {
    const [gender, setGender] = useState('');
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            console.error('No session found:', error);
            router.replace('/register');
            return;
        }
    };

    const handleSaveProfile = async () => {
        if (!gender || !dateOfBirth || !weight || !height) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('No authenticated user found');
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    gender: gender,
                    birth_date: dateOfBirth.toISOString().split('T')[0],
                    age: calculateAge(dateOfBirth),
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <ExerciseIllustration />
                </View>

                <Text style={styles.title}>Let's complete your profile</Text>
                <Text style={styles.subtitle}>It will help us to know more about you!</Text>

                <View style={styles.form}>
                    <Pressable
                        style={styles.input}
                        onPress={() => setShowGenderPicker(true)}
                    >
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <Text style={[styles.inputText, !gender && styles.placeholder]}>
                            {gender || 'Choose Gender'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </Pressable>

                    <Pressable 
                        style={styles.input}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={[styles.inputText, !dateOfBirth && styles.placeholder]}>
                            {formatDate(dateOfBirth)}
                        </Text>
                    </Pressable>

                    <View style={styles.inputWithUnit}>
                        <View style={[styles.input, styles.flex1]}>
                            <Ionicons name="scale-outline" size={20} color="#666" />
                            <TextInput
                                placeholder="Your Weight"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                style={styles.inputText}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={styles.unitBadge}>
                            <Text style={styles.unitText}>KG</Text>
                        </View>
                    </View>

                    <View style={styles.inputWithUnit}>
                        <View style={[styles.input, styles.flex1]}>
                            <Ionicons name="resize-outline" size={20} color="#666" />
                            <TextInput
                                placeholder="Your Height"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                style={styles.inputText}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={styles.unitBadge}>
                            <Text style={styles.unitText}>CM</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSaveProfile}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#FF9DC4', '#FF6B9C']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Complete Profile</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Gender Picker Modal */}
                <Modal
                    visible={showGenderPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Gender</Text>
                            {['Female', 'Male', 'Other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setGender(option);
                                        setShowGenderPicker(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowGenderPicker(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setDateOfBirth(selectedDate);
                            }
                        }}
                        maximumDate={new Date()}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    form: {
        gap: 15,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        gap: 10,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    placeholder: {
        color: '#999',
    },
    inputWithUnit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    flex1: {
        flex: 1,
    },
    unitBadge: {
        backgroundColor: '#FF9DC4',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    unitText: {
        color: '#fff',
        fontWeight: '600',
    },
    button: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalCancelButton: {
        marginTop: 15,
        padding: 15,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#FF6B9C',
        textAlign: 'center',
        fontWeight: '600',
    },
});