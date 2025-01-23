import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import AdminWorkoutScreen from '../../components/Admin/AdminWorkoutScreen';
import AdminUsersScreen from '../../components/Admin/AdminUsersScreen';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'workouts' | 'users'>('workouts');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'workouts' && styles.activeTabButton]}
          onPress={() => setActiveTab('workouts')}
        >
          <LinearGradient
            colors={activeTab === 'workouts' ? ['#92A3FD', '#9DCEFF'] : ['#F7F8F8', '#F7F8F8']}
            style={styles.tabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'workouts' && styles.activeTabText
            ]}>
              Workouts
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'users' && styles.activeTabButton]}
          onPress={() => setActiveTab('users')}
        >
          <LinearGradient
            colors={activeTab === 'users' ? ['#92A3FD', '#9DCEFF'] : ['#F7F8F8', '#F7F8F8']}
            style={styles.tabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText
            ]}>
              Benutzer
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'workouts' ? (
          <AdminWorkoutScreen />
        ) : (
          <AdminUsersScreen />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E7E8',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeTabButton: {
    elevation: 2,
    shadowColor: '#92A3FD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabGradient: {
    borderRadius: 14,
    padding: 12,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#7B6F72',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
