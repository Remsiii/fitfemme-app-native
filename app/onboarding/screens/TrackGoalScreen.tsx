import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function TrackGoalScreen() {
    const imageAnimation = new Animated.Value(0);
    const textAnimation = new Animated.Value(0);
    const buttonAnimation = new Animated.Value(0);
    const bounceAnimation = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(imageAnimation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            Animated.timing(textAnimation, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            Animated.timing(buttonAnimation, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnimation, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                Animated.timing(bounceAnimation, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
            ])
        ).start();
    }, []);

    const progress = 0.25; // Example progress value for TrackGoalScreen

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View 
                    style={[
                        styles.imageContainer,
                        {
                            opacity: imageAnimation,
                            transform: [
                                {
                                    translateY: imageAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Image 
                        source={require('../../../assets/images/track-goal.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View 
                    style={[
                        styles.textContainer,
                        {
                            opacity: textAnimation,
                            transform: [
                                {
                                    translateY: textAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.title}>Track Your Goal</Text>
                    <Text style={styles.description}>
                        Don't worry if you have trouble determining your goals, We can help you determine your goals and track your goals
                    </Text>
                </Animated.View>

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
                        onPress={() => router.push('/onboarding/get-burn')}
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
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D1617',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#7B6F72',
        textAlign: 'center',
        lineHeight: 21,
        paddingHorizontal: 20,
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
    buttonGradient: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
}); 