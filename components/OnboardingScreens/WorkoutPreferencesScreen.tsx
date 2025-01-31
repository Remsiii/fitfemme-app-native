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

export function WorkoutPreferencesScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="barbell-outline" size={120} color="#6B8BF5" />
                    </View>
                </View>
                
                <Text style={styles.title}>Customize Your Plan</Text>
                <Text style={styles.subtitle}>
                    Tell us about your workout preferences and we'll create a personalized plan just for you
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => router.push('/register')}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
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
