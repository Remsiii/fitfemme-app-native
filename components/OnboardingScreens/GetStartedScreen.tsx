import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export function GetStartedScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo and Brand */}
                <View style={styles.brandContainer}>
                    <Text style={styles.brandName}>FitFemme</Text>
                    <Text style={styles.tagline}>Everybody Can Train</Text>
                </View>

                {/* Main Illustration */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/images/welcome-fitness.png')}
                        style={styles.mainImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Bottom Content */}
                <View style={styles.bottomContent}>
                    <Text style={styles.title}>Welcome to FitFemme</Text>
                    <Text style={styles.subtitle}>
                        Train and live the new experience of exercising at home
                    </Text>

                    <TouchableOpacity 
                        onPress={() => router.push('/onboarding/track-goals')}
                    >
                        <LinearGradient
                            colors={['#92A3FD', '#9DCEFF']}
                            style={styles.button}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    brandContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    brandName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1D1617',
        letterSpacing: 1,
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
    mainImage: {
        width: '90%',
        height: '90%',
    },
    bottomContent: {
        width: '100%',
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D1617',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#7B6F72',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        width: width - 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#92A3FD',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
