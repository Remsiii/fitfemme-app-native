import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function TrackGoalsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="trophy-outline" size={120} color="#6B8BF5" />
                    </View>
                </View>
                
                <Text style={styles.title}>Track Your Goal</Text>
                <Text style={styles.subtitle}>
                    Don't worry if you have trouble determining your goals, We can help you determine your goals and track your goals
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => router.push('/onboarding/workout-preferences')}
                    >
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
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
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 200,
        height: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#6B8BF5',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
