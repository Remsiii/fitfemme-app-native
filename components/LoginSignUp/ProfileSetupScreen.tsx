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
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Circle } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge } from '@/utils/dateUtils';
import { useRequiredDataCheck } from '@/hooks/useRequiredDataCheck';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const { width } = Dimensions.get('window');

const ExerciseIllustration = () => (
    <Svg width={width * 0.5} height={width * 0.5} viewBox="0 0 400 400">
        {/* Background blob */}
        <Path
            d="M50,250 Q150,150 250,250 T450,250"
            fill="#A5B9FF"
            opacity="0.3"
        />
        {/* Exercise figure - simplified version */}
        <Circle cx="200" cy="120" r="40" fill="#7C9EFF" />
        <Path
            d="M200,160 L200,280 M160,200 L240,200 M180,320 L200,280 L220,320"
            stroke="#7C9EFF"
            strokeWidth="20"
            strokeLinecap="round"
        />
    </Svg>
);

export default function ProfileSetupScreen() {
    const { userData, missingFields, isLoading: checkingData } = useRequiredDataCheck();
    const [gender, setGender] = useState('');
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (userData) {
            if (userData.gender) setGender(userData.gender);
            if (userData.birth_date) setDateOfBirth(new Date(userData.birth_date));
            if (userData.weight) setWeight(userData.weight.toString());
            if (userData.height) setHeight(userData.height.toString());
        }
    }, [userData]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleSaveProfile = async () => {
        if (!gender || !dateOfBirth || !weight || !height) {
            Alert.alert('Missing Information', 'Please fill in all fields to continue');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    password_hash: '',
                    gender,
                    birth_date: dateOfBirth.toISOString(),
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Database error:', error);
                throw error;
            }
            router.push('/goal-selection');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
            console.error('Error saving profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {checkingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C9EFF" />
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.header}>
                        <ExerciseIllustration />
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Help us personalize your fitness journey
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Pressable
                            style={[
                                styles.input,
                                missingFields.gender && styles.inputError,
                                gender && styles.inputFilled
                            ]}
                            onPress={() => setShowGenderPicker(true)}
                        >
                            <Text style={[
                                styles.inputText,
                                !gender && styles.placeholderText
                            ]}>
                                {gender || 'Select Gender'}
                            </Text>
                            <Ionicons name="chevron-down" size={24} color="#666" />
                        </Pressable>

                        <TouchableOpacity
                            style={[
                                styles.input,
                                missingFields.birth_date && styles.inputError,
                                dateOfBirth && styles.inputFilled
                            ]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View style={styles.inputContent}>
                                <View style={styles.inputLeft}>
                                    <Ionicons name="calendar-outline" size={24} color="#666" />
                                    <Text style={styles.inputText}>
                                        {formatDate(dateOfBirth)}
                                    </Text>
                                </View>
                                <Text style={styles.ageText}>
                                    {calculateAge(dateOfBirth)} years old
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        missingFields.weight && styles.inputError,
                                        weight && styles.inputFilled
                                    ]}
                                    placeholder="Weight (kg)"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666"
                                />
                                <Text style={styles.unit}>kg</Text>
                            </View>
                            <View style={styles.halfInput}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        missingFields.height && styles.inputError,
                                        height && styles.inputFilled
                                    ]}
                                    placeholder="Height (cm)"
                                    value={height}
                                    onChangeText={setHeight}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666"
                                />
                                <Text style={styles.unit}>cm</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSaveProfile}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#7C9EFF', '#FF6B9C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Continue</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <Modal
                        visible={showGenderPicker}
                        transparent={true}
                        animationType="slide"
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowGenderPicker(false)}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select Gender</Text>
                                    <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                                        <Text style={styles.modalDoneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                {['Male', 'Female', 'Other'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.modalOption,
                                            gender === option && styles.modalOptionSelected
                                        ]}
                                        onPress={() => {
                                            setGender(option);
                                            setShowGenderPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalOptionText,
                                            gender === option && styles.modalOptionTextSelected
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        onConfirm={(date) => {
                            setDateOfBirth(date);
                            setShowDatePicker(false);
                        }}
                        onCancel={() => setShowDatePicker(false)}
                        maximumDate={new Date()}
                        minimumDate={new Date('1900-01-01')}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    form: {
        flex: 1,
        gap: 16,
    },
    input: {
        height: 56,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    inputLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    inputText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    placeholderText: {
        color: '#666',
    },
    ageText: {
        fontSize: 14,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfInput: {
        flex: 1,
        position: 'relative',
    },
    unit: {
        position: 'absolute',
        right: 16,
        top: 18,
        color: '#666',
    },
    button: {
        marginTop: 'auto',
        marginBottom: 20,
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    modalDoneText: {
        color: '#7C9EFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalOptionSelected: {
        backgroundColor: '#F0F5FF',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    modalOptionTextSelected: {
        color: '#7C9EFF',
        fontWeight: '600',
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    inputFilled: {
        borderColor: '#7C9EFF',
    },
});