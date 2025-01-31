import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const RunnerIllustration = () => (
    <Svg width={width * 0.8} height={width * 0.8} viewBox="0 0 400 400">
        <Defs>
            <LinearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#7C9EFF" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#A5B9FF" stopOpacity="0.2" />
            </LinearGradient>
        </Defs>
        {/* Background wave */}
        <Path
            d="M50,150 Q150,50 250,150 T450,150"
            fill="url(#backgroundGradient)"
        />
        {/* Runner figure */}
        <Path
            d="M200,100 
         L220,120 
         L240,150 
         C260,170 280,190 260,210 
         L240,230 
         L220,210 
         L200,190 
         Z"
            fill="#6B7280"
        />
        {/* Legs */}
        <Path
            d="M220,210 
         L240,250 
         L260,270"
            stroke="#6B7280"
            strokeWidth="20"
            strokeLinecap="round"
        />
        <Path
            d="M200,190 
         L180,230 
         L160,250"
            stroke="#6B7280"
            strokeWidth="20"
            strokeLinecap="round"
        />
    </Svg>
);

interface OnboardingScreenProps {
    onNext: () => void;
}

const OnboardingScreen1 = ({ onNext }: OnboardingScreenProps) => {
    const buttonAnimation = new Animated.Value(1);
    const screenAnimation = new Animated.Value(0);

    const handlePressIn = () => {
        Animated.spring(buttonAnimation, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonAnimation, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        Animated.timing(screenAnimation, {
            toValue: -width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.push('/onboarding/onboarding2');
        });
    };

    return (
        <Animated.View style={[
            styles.container,
            {
                transform: [{ translateX: screenAnimation }]
            }
        ]}>
            <SafeAreaView style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <RunnerIllustration />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Get Burn</Text>
                    <Text style={styles.description}>
                        Let's keep burning, to achieve yours goals, it hurts only temporarily, if you give up now
                        you will be in pain forever
                    </Text>
                </View>

                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Animated.View
                        style={[
                            styles.nextButton,
                            {
                                transform: [{ scale: buttonAnimation }]
                            }
                        ]}
                    >
                        <Ionicons name="arrow-forward" size={24} color="#FFF" />
                    </Animated.View>
                </TouchableOpacity>
            </SafeAreaView>
        </Animated.View>
    );
};

export default OnboardingScreen1;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        width: '100%',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#7C9EFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C9EFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});