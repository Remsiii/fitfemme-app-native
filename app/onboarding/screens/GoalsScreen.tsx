import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const goals = [
    {
        id: 'weight-loss',
        title: 'Lose Weight',
        description: 'I want to lose weight and get leaner',
        icon: 'scale-outline',
        gradient: ['#FF9DC4', '#FF6B9C'],
    },
    {
        id: 'build-muscle',
        title: 'Build Muscle',
        description: 'I want to build muscle and get stronger',
        icon: 'barbell-outline',
        gradient: ['#92A3FD', '#9DCEFF'],
    },
    {
        id: 'stay-fit',
        title: 'Stay Fit',
        description: 'I want to maintain my weight and stay healthy',
        icon: 'fitness-outline',
        gradient: ['#FFB86B', '#FFD4A0'],
    },
];

export default function GoalsScreen() {
    const [selectedGoal, setSelectedGoal] = useState('');
    const progress = 0.0; // Example progress value for WelcomeScreen

    // Define animation values
    const buttonAnimation = new Animated.Value(0);
    const bounceAnimation = new Animated.Value(0);

    useEffect(() => {
        // Start animations
        Animated.timing(buttonAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnimation, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnimation, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What's your goal?</Text>
            <Text style={styles.subtitle}>
                This helps us create your personalized plan
            </Text>

            <ScrollView style={styles.goalsContainer}>
                {goals.map((goal) => (
                    <TouchableOpacity
                        key={goal.id}
                        onPress={() => setSelectedGoal(goal.id)}
                        style={[
                            styles.goalCard,
                            selectedGoal === goal.id && styles.selectedGoal,
                        ]}
                    >
                        <LinearGradient
                            colors={goal.gradient}
                            style={styles.iconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name={goal.icon} size={24} color="#fff" />
                        </LinearGradient>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalDescription}>
                                {goal.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Animated.View 
                style={[
                    styles.nextButton,
                    {
                        opacity: buttonAnimation,
                        transform: [
                            {
                                scale: bounceAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.1],
                                }),
                            },
                            {
                                translateY: bounceAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -5],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !selectedGoal && styles.disabledButton,
                    ]}
                    onPress={() => selectedGoal && router.push('/onboarding/profile')}
                    disabled={!selectedGoal}
                >
                    <Svg height="60" width="60" viewBox="0 0 100 100">
                        <Circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#92A3FD"
                            strokeWidth="5"
                            fill="none"
                            strokeDasharray={`${progress * 283} 283`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                        />
                    </Svg>
                    <LinearGradient
                        colors={['#92A3FD', '#9DCEFF']}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D1617',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#7B6F72',
        marginBottom: 32,
    },
    goalsContainer: {
        flex: 1,
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F7F8F8',
        borderRadius: 16,
        marginBottom: 16,
    },
    selectedGoal: {
        backgroundColor: '#EEF0FF',
        borderWidth: 2,
        borderColor: '#92A3FD',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1617',
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 12,
        color: '#7B6F72',
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 50,
        right: 30,
    },
    disabledButton: {
        opacity: 0.5,
    },
    gradient: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 