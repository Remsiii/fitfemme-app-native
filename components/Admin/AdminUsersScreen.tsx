import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

interface User {
    id: string;
    full_name?: string;
    email: string;
    last_login?: string;
    is_active: boolean;
    profile_picture_url?: string;
}

export default function AdminUsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setRefreshing(true);
            const { data, error } = await supabase.from('users').select('*');
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleImageUpload = async (userId: string) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setLoading(true);
                const filePath = `${userId}/${new Date().getTime()}.jpg`;
                const contentType = 'image/jpeg';

                const { error: uploadError } = await supabase.storage
                    .from('user_photos')
                    .upload(filePath, decode(result.assets[0].base64), {
                        contentType,
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('user_photos')
                    .getPublicUrl(filePath);

                const { error: updateError } = await supabase
                    .from('users')
                    .update({ profile_picture_url: publicUrl })
                    .eq('id', userId);

                if (updateError) throw updateError;

                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId
                            ? { ...user, profile_picture_url: publicUrl }
                            : user
                    )
                );
                setLoading(false);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
            setLoading(false);
        }
    };

    const renderUserItem = ({ item, index }: { item: User; index: number }) => (
        <Animatable.View
            animation="fadeInUp"
            delay={index * 100}
            useNativeDriver
        >
            <BlurView intensity={80} tint="light" style={styles.userCard}>
                <View style={styles.userHeader}>
                    <TouchableOpacity
                        onPress={() => handleImageUpload(item.id)}
                        style={styles.avatarContainer}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FF6B9C" />
                        ) : (
                            <Animatable.View
                                animation="zoomIn"
                                duration={500}
                                delay={index * 100 + 200}
                                useNativeDriver
                            >
                                {item.profile_picture_url ? (
                                    <Image
                                        source={{ uri: item.profile_picture_url }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                                        <Text style={styles.avatarText}>
                                            {item.full_name?.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </Animatable.View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.full_name || 'Unnamed User'}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <Animatable.View
                        animation="bounceIn"
                        delay={index * 100 + 400}
                        useNativeDriver
                        style={[
                            styles.statusIndicator,
                            item.is_active ? styles.activeStatus : styles.inactiveStatus,
                        ]}
                    />
                </View>

                <View style={styles.userDetails}>
                    <Text style={styles.lastLoginText}>
                        Letzter Login: {item.last_login
                            ? new Date(item.last_login).toLocaleDateString('de-DE', {
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : 'Noch nie'}
                    </Text>
                </View>
            </BlurView>
        </Animatable.View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B9C" />
                <Text style={styles.loadingText}>Lade Benutzer...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animatable.View
                animation="fadeInDown"
                duration={500}
                useNativeDriver
                style={styles.header}
            >
                <Text style={styles.title}>Benutzer Verwaltung</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchUsers}
                    disabled={refreshing}
                >
                    <Text style={styles.refreshButtonText}>Aktualisieren</Text>
                </TouchableOpacity>
            </Animatable.View>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={fetchUsers}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Keine Benutzer gefunden</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        backgroundColor: '#FF6B9C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B9C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    userCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarContainer: {
        marginRight: 16,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6B9C',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 8,
    },
    activeStatus: {
        backgroundColor: '#4CAF50',
    },
    inactiveStatus: {
        backgroundColor: '#FF5252',
    },
    userDetails: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    lastLoginText: {
        fontSize: 14,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 32,
    },
});
