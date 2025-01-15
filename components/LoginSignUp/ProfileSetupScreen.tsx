import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Svg, Path, Circle } from 'react-native-svg';

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
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

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

                    <Pressable style={styles.input}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={[styles.inputText, !dateOfBirth && styles.placeholder]}>
                            Date of Birth
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
                </View>

                <TouchableOpacity style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
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
        padding: 24,
        flex: 1,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
    },
    inputWithUnit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    inputText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    placeholder: {
        color: '#999',
    },
    unitBadge: {
        backgroundColor: '#E4A5FF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    unitText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#7C9EFF',
        borderRadius: 25,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});