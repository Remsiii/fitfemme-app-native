import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
    SafeAreaView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { triggerButtonHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>FitnessX</Text>
                    <Text style={styles.tagline}>Everybody Can Train</Text>
                </View>

                <View style={styles.imageContainer}>
                    <Image 
                        source={require('../../../assets/images/react-logo.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

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
                        onPress={async () => {
                            await triggerButtonHaptic();
                            router.push('/onboarding/track-goal');
                        }}
                        style={styles.buttonContainer}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'ios' ? 20 : 60,
        position: 'relative',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#1D1617',
    },
    tagline: {
        fontSize: 18,
        color: '#7B6F72',
        marginTop: 5,
    },
    imageContainer: {
        width: width,
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '9%',
        height: '9%',
    },
    nextButton: {
        width: 60,
        height: 60,
        position: 'absolute',
        bottom: 50,
        right: 30,
        zIndex: 1000,
    },
    buttonContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    buttonGradient: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        position: 'absolute',
        top: 0,
        left: 0,
    },
}); 