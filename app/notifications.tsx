import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  RefreshControl,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSettings } from '../context/SettingsContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  image_url?: string;
  sender_name?: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { triggerHaptic } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      triggerHaptic();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== id));
      triggerHaptic();
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

              if (error) throw error;

              setNotifications([]);
              triggerHaptic();
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return 'barbell-outline';
      case 'water':
        return 'water-outline';
      case 'period':
        return 'calendar-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    id: string
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(id)}
      >
        <Animated.View
          style={[
            styles.deleteButtonContent,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'Notifications',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            notifications.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllNotifications}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length > 0 ? (
          <View style={styles.notificationList}>
            {notifications.map((notification) => (
              <Swipeable
                key={notification.id}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, notification.id)
                }
                overshootRight={false}
                friction={2}
              >
                <TouchableOpacity
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification,
                    notification.type === 'andree-workout' && styles.andreeNotification
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  {notification.type === 'andree-workout' ? (
                    <LinearGradient
                      colors={['#FF6B9C', '#FF8FAF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.andreeGradient}
                    >
                      <View style={styles.andreeContent}>
                        <View style={styles.andreeHeader}>
                          <Image
                            source={require('../assets/images/andree.jpg')}
                            style={styles.profileImage}
                          />
                          <View style={styles.andreeHeaderText}>
                            <Text style={styles.andreeTitle}>
                              {notification.sender_name} <Text style={styles.andreeEmoji}>👋</Text>
                            </Text>
                            <Text style={styles.andreeTime}>
                              {getRelativeTime(notification.created_at)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.andreeMessage}>
                          {notification.message}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <>
                      <View style={styles.notificationIcon}>
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={24}
                          color="#007AFF"
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {getRelativeTime(notification.created_at)}
                        </Text>
                      </View>
                    </>
                  )}
                  {!notification.read && <View style={[
                    styles.unreadDot,
                    notification.type === 'andree-workout' && styles.andreeUnreadDot
                  ]} />}
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>
              Pull down to refresh
            </Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  backButton: {
    marginLeft: 8,
  },
  clearButton: {
    marginRight: 16,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  notificationList: {
    paddingVertical: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
  },
  deleteButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  andreeGradient: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  andreeContent: {
    padding: 16,
  },
  andreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  andreeHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  andreeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  andreeEmoji: {
    fontSize: 16,
  },
  andreeMessage: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  andreeTime: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    marginTop: 2,
  },
  andreeNotification: {
    backgroundColor: 'transparent',
    borderLeftWidth: 0,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#FF6B9C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  andreeUnreadDot: {
    backgroundColor: '#FF6B9C',
  },
});
