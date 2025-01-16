import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        console.log('Register button pressed');

        // Validate inputs
        if (!firstName || !lastName || !email || !password) {
            console.log('Validation failed: missing fields');
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!acceptedTerms) {
            console.log('Validation failed: terms not accepted');
            Alert.alert('Error', 'Please accept the terms and conditions');
            return;
        }

        if (password.length < 6) {
            console.log('Validation failed: password too short');
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Attempting to register with Supabase...');
            // Register the user with Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData?.user) {
                console.log('Auth successful, inserting into users table...');
                // Insert into users table
                const { error: usersError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            email: email,
                            password_hash: '', // This will be handled by Supabase Auth
                            username: email.split('@')[0], // Generate username from email
                            full_name: `${firstName} ${lastName}`,
                            profile_picture_url: null,
                            is_active: true,
                            last_login: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            language: 'en',
                            age: null,
                            weight: null,
                            height: null,
                            goal: null
                        }
                    ]);

                if (usersError) {
                    console.error('Error inserting into users table:', usersError);
                    throw new Error('Failed to create user profile');
                }

                Alert.alert(
                    'Success',
                    'Registration successful! Please check your email to verify your account.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('Navigating to login...');
                                router.replace('/login');
                            }
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.log('Registration error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.greeting}>Hey there,</Text>
                <Text style={styles.title}>Create an Account</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <TextInput
                            placeholder="First Name"
                            style={styles.input}
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <TextInput
                            placeholder="Last Name"
                            style={styles.input}
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#666" />
                        <TextInput
                            placeholder="Email"
                            style={styles.input}
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" />
                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#666"
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.termsContainer}>
                    <Pressable
                        style={styles.checkbox}
                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                        disabled={isLoading}
                    >
                        {acceptedTerms && <Ionicons name="checkmark" size={16} color="#666" />}
                    </Pressable>
                    <Text style={styles.termsText}>
                        By continuing you accept our{' '}
                        <Text style={styles.link}>Privacy Policy</Text> and{' '}
                        <Text style={styles.link}>Term of Use</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.registerButton, isLoading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.orText}>Or</Text>

                <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
                        <Ionicons name="logo-google" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
                        <Ionicons name="logo-facebook" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/login')}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginLink}>Login</Text>
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
        padding: 24,
    },
    greeting: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 32,
    },
    inputContainer: {
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 24,
        marginBottom: 32,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    link: {
        color: '#666',
        textDecorationLine: 'underline',
    },
    registerButton: {
        backgroundColor: '#7C9EFF',
        borderRadius: 25,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#7C9EFF',
        fontSize: 14,
        fontWeight: '600',
    },
});