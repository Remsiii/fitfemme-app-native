import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import RegisterScreen from '@/components/LoginSignUp/RegisterScreen';

export default function Register() {
    return <RegisterScreen />;
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', padding: 10, marginBottom: 15, borderWidth: 1, borderRadius: 5 },
    button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', width: '100%' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});
