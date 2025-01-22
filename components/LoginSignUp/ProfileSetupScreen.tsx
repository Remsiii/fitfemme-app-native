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
    const [gender, setGender] = useState('female');
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                console.log('Profile data:', data);

                if (error) throw error;

                if (data) {
                    setGender('female');
                    if (data.birth_date) {
                        const date = new Date(data.birth_date);
                        console.log('Birth date from DB:', data.birth_date);
                        console.log('Parsed date:', date);
                        setDateOfBirth(date);
                    }
                    if (data.weight) setWeight(data.weight.toString());
                    if (data.height) setHeight(data.height.toString());
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const formatDate = (date: Date) => {
        console.log('Formatting date:', date);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateAge = (birthDate: Date) => {
        console.log('Calculating age for date:', birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        console.log('Calculated age:', age);
        return age;
    };

    const handleSaveProfile = async () => {
        if (!dateOfBirth || !weight || !height) {
            Alert.alert('Missing Information', 'Please fill in all fields to continue');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');
            if (!user.email) throw new Error('No email found');

            const profileData = {
                id: user.id,
                email: user.email,
                password_hash: '',
                gender: 'female',
                birth_date: dateOfBirth.toISOString(),
                weight: parseFloat(weight),
                height: parseFloat(height),
                updated_at: new Date().toISOString(),
            };

            console.log('Saving profile data:', profileData);

            const { data, error } = await supabase
                .from('users')
                .upsert(profileData)
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
                throw error;
            }

            console.log('Saved profile data:', data);

            // Wait a moment to ensure the data is properly saved
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use replace instead of push to prevent going back
            router.replace('/goal-selection');
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
                        <View
                            style={[
                                styles.input,
                                styles.inputFilled
                            ]}
                        >
                            <Text style={[styles.inputText]}>Female</Text>
                        </View>

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
                                    {Platform.OS === 'web' ? (
                                        <input
                                            type="date"
                                            value={dateOfBirth.toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                const newDate = new Date(e.target.value);
                                                setDateOfBirth(newDate);
                                            }}
                                            style={{
                                                border: 'none',
                                                fontSize: 16,
                                                color: '#1A1A1A',
                                                fontFamily: 'inherit',
                                                marginLeft: 8,
                                                outline: 'none'
                                            }}
                                            max={new Date().toISOString().split('T')[0]}
                                            min="1900-01-01"
                                        />
                                    ) : (
                                        <Text style={styles.inputText}>
                                            {formatDate(dateOfBirth)}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.ageText}>
                                    {dateOfBirth ? `${calculateAge(dateOfBirth)} years old` : 'Select date'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {Platform.OS !== 'web' && (
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                onConfirm={(date) => {
                                    setDateOfBirth(date);
                                    setShowDatePicker(false);
                                }}
                                onCancel={() => setShowDatePicker(false)}
                                date={dateOfBirth}
                                maximumDate={new Date()}
                                minimumDate={new Date('1900-01-01')}
                                modalStyleIOS={{
                                    margin: 0,
                                    justifyContent: 'flex-end'
                                }}
                                pickerContainerStyleIOS={{
                                    paddingTop: 20,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    backgroundColor: 'white'
                                }}
                            />
                        )}
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
                                <Text style={[styles.unit, { position: 'absolute', right: 10 }]}>kg</Text>
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
                                <Text style={[styles.unit, { position: 'absolute', right: 10 }]}>cm</Text>
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
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A1A',
        width: '100%',
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
    ageText: {
        fontSize: 14,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 15,
    },
    halfInput: {
        flex: 1,
        position: 'relative',
    },
    unit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
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
    inputError: {
        borderColor: '#FF6B6B',
    },
    inputFilled: {
        borderColor: '#7C9EFF',
        backgroundColor: '#FFFFFF',
    },
});