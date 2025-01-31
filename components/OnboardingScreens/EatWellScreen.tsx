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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ChefIllustration = () => (
    <Svg width={width * 0.8} height={width * 0.8} viewBox="0 0 400 400">
        {/* Background */}
        <Circle cx="200" cy="200" r="200" fill="#E8EFFF" />
        
        {/* Chef body */}
        <Rect x="140" y="150" width="120" height="160" fill="#4A4A4A" rx="10" />
        <Rect x="160" y="130" width="80" height="40" fill="#6B6B6B" rx="5" />
        
        {/* Head */}
        <Circle cx="200" cy="100" r="40" fill="#FFE0D0" />
        <Path d="M180 90 Q200 100 220 90" stroke="#4A4A4A" strokeWidth="2" fill="none" />
        
        {/* Bowl with plants */}
        <Circle cx="200" cy="200" r="30" fill="#FFFFFF" />
        <Path
            d="M185 190 C190 180 195 185 200 175 C205 185 210 180 215 190"
            stroke="#4CAF50"
            strokeWidth="3"
            fill="none"
        />
    </Svg>
);

interface EatWellScreenProps {
    onNext: () => void;
}

const EatWellScreen = ({ onNext }: EatWellScreenProps) => {
    const buttonAnimation = new Animated.Value(1);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <ChefIllustration />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Eat Well</Text>
                    <Text style={styles.description}>
                        Let's start a healthy lifestyle with us, we can determine your diet every day. healthy eating is fun
                    </Text>
                </View>

                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={onNext}
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    illustrationContainer: {
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#7C9EFF',
        alignItems: 'center',
        justifyContent: 'center',
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

export default EatWellScreen;
