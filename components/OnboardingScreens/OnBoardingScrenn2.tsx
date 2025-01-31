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

        {/* Body */}
        <Path
            d="M180,140 
         C180,140 200,130 220,140
         C240,150 250,160 260,180
         C270,200 260,220 240,230
         C220,240 200,230 190,220
         C180,210 175,200 180,190
         Z"
            fill="#6B7280"
        />

        {/* Head */}
        <Path
            d="M200,110 
         C210,110 220,120 220,130
         C220,140 210,150 200,150
         C190,150 180,140 180,130
         C180,120 190,110 200,110"
            fill="#6B7280"
        />

        {/* Running legs */}
        <Path
            d="M190,220 
         L170,260 
         C165,270 160,280 155,285"
            stroke="#6B7280"
            strokeWidth="20"
            strokeLinecap="round"
        />
        <Path
            d="M240,230 
         L260,260 
         C265,270 270,275 275,280"
            stroke="#6B7280"
            strokeWidth="20"
            strokeLinecap="round"
        />

        {/* Arms */}
        <Path
            d="M200,160 
         L170,180 
         C160,185 155,190 150,195"
            stroke="#6B7280"
            strokeWidth="15"
            strokeLinecap="round"
        />
        <Path
            d="M240,160 
         L270,180 
         C280,185 285,190 290,195"
            stroke="#6B7280"
            strokeWidth="15"
            strokeLinecap="round"
        />
    </Svg>
);

interface OnboardingScreenProps {
    onNext: () => void;
}

const OnboardingScreen2 = ({ onNext }: OnboardingScreenProps) => {
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
            router.push('/onboarding/eat-well');
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
                    <Text style={styles.title}>Track Your Goal</Text>
                    <Text style={styles.description}>
                        Don't worry if you have trouble determining your goals, we can help you determine your goals and track your goals
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

export default OnboardingScreen2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        marginTop: 40,
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
    buttonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: '#7C9EFF',
    },
});