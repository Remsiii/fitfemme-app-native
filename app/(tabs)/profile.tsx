import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Switch,
    Alert,
    Modal,
    FlatList,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useRouter } from "expo-router";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { useAuthProtection } from '@/hooks/useAuthProtection';

type RootStackParamList = {
    login: undefined;
    Profile: undefined;
    PersonalData: undefined;
    Achievement: undefined;
    ActivityHistory: undefined;
    WorkoutProgress: undefined;
    ContactUs: undefined;
    PrivacyPolicy: undefined;
    Settings: undefined;
    admin: undefined;
    'edit-profile': undefined;
};

const Profile = () => {
    const router = useRouter();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isLoading, setIsLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { isLoading: authLoading, isAuthenticated, handleLogout } = useAuthProtection();
    const [profile, setProfile] = useState<{
        full_name: string;
        email: string;
        avatar_url: string;
        age: string | number;
        weight: string | number;
        height: string | number;
        goal: string;
        birth_date?: string | null;
    }>({
        full_name: "New User",
        email: "",
        avatar_url: "",
        age: "N/A",
        weight: "N/A",
        height: "N/A",
        goal: "No specific goal",
        birth_date: null
    });
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { hapticEnabled, toggleHaptic } = useSettings();
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const predefinedAvatars = [
        { id: 'blonde-photo', source: require('../../assets/images/blonde.webp') },
        { id: 'blonde', source: require('../../assets/avatars/blonde-fitness.svg') },
        { id: 'brunette', source: require('../../assets/avatars/brunette-fitness.svg') },
        { id: 'black-hair', source: require('../../assets/avatars/black-hair-fitness.svg') },
    ];

    const calculateAge = (birthDate: string | null) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            if (!user) {
                throw new Error('No authenticated user found');
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Calculate age from birth_date
            const age = data.birth_date ? calculateAge(data.birth_date) : "N/A";

            setProfile({
                full_name: data.full_name || "New User",
                email: data.email || "",
                avatar_url: data.avatar_url || "",
                age: age,
                weight: data.weight ? `${data.weight} kg` : "N/A",
                height: data.height ? `${data.height} cm` : "N/A",
                goal: data.fitness_goal || "No specific goal",
                birth_date: data.birth_date
            });

            setIsAdmin(data.is_admin || false);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
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
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setIsLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No user found');

                const filePath = `${user.id}/${new Date().getTime()}.jpg`;
                const contentType = 'image/jpeg';
                
                // Upload image to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('user_photos')
                    .upload(filePath, decode(result.assets[0].base64), {
                        contentType,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('user_photos')
                    .getPublicUrl(filePath);

                // Update user profile with the new avatar URL
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id)
                    .select();

                if (updateError) throw updateError;

                setProfile(prev => ({
                    ...prev,
                    avatar_url: publicUrl
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectPredefinedAvatar = async (avatar) => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Update user profile with selected avatar
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: avatar.source })
                .eq('id', user.id)
                .select();

            if (updateError) throw updateError;

            setProfile(prev => ({
                ...prev,
                avatar_url: avatar.source
            }));

            setShowAvatarModal(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C9EFF" />
            </View>
        );
    }

    const handleLogoutPress = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [

                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: handleLogout,
                    style: "destructive"
                }
            ]
        );
    };

    const renderThreeDotsMenu = () => {
        return (
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(!showMenu)}>
                <Ionicons name="ellipsis-vertical" size={24} color="#000" />
            </TouchableOpacity>
        );
    };

    const renderMenu = () => {
        if (!showMenu) return null;
        return (
            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                        setShowMenu(false);
                        handleLogoutPress();
                    }}>
                    <Ionicons name="log-out-outline" size={20} color="#FF0000" />
                    <Text style={[styles.menuItemText, { color: '#FF0000' }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const MenuLink = ({ icon, title, onPress }: { icon: string, title: string, onPress: () => void }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon as any} size={24} color="#666" style={styles.menuIcon} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                {/* <Text style={styles.headerTitle}>Profile</Text> */}
                {renderThreeDotsMenu()}
            </View>
            {renderMenu()}
            <View style={styles.profileSection}>
                <TouchableOpacity onPress={() => setShowAvatarModal(true)} style={styles.avatarContainer}>
                    {profile.avatar_url ? (
                        profile.avatar_url.startsWith('http') ? (
                            <Image
                                source={{ uri: profile.avatar_url }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Image
                                source={predefinedAvatars.find(a => a.id === profile.avatar_url)?.source || predefinedAvatars[0].source}
                                style={styles.avatar}
                            />
                        )
                    ) : (
                        <Image
                            source={predefinedAvatars[0].source}
                            style={styles.avatar}
                        />
                    )}
                    <View style={styles.editIconContainer}>
                        <Ionicons name="pencil" size={14} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{profile.full_name}</Text>
                <Text style={styles.program}>{profile.goal}</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push('/edit-profile')}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.height}</Text>
                        <Text style={styles.statLabel}>Height</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.weight}</Text>
                        <Text style={styles.statLabel}>Weight</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.age}</Text>
                        <Text style={styles.statLabel}>Age</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <MenuLink icon="person-outline" title="Personal Data" onPress={() => navigation.navigate("PersonalData")} />
                <MenuLink icon="trophy-outline" title="Achievement" onPress={() => navigation.navigate("Achievement")} />
                <MenuLink icon="time-outline" title="Activity History" onPress={() => navigation.navigate("ActivityHistory")} />
                <MenuLink icon="fitness-outline" title="Workout Progress" onPress={() => navigation.navigate("WorkoutProgress")} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notification</Text>
                <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                        <Ionicons name="notifications-outline" size={24} color="#666" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Pop-up Notification</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#D1D1D6", true: "#6B8CFF" }}
                        thumbColor={"#FFFFFF"}
                    />
                </View>
                <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                        <Ionicons name="notifications-outline" size={24} color="#666" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Haptic Feedback</Text>
                    </View>
                    <Switch
                        value={hapticEnabled}
                        onValueChange={toggleHaptic}
                        trackColor={{ false: "#D1D1D6", true: "#6B8CFF" }}
                        thumbColor={"#FFFFFF"}
                    />
                </View>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Menu</Text>
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/admin')}
                    >
                        <View style={styles.menuItemContent}>
                            <Ionicons name="settings-outline" size={24} color="#333" />
                            <Text style={styles.menuItemText}>Admin Dashboard</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                )}
                <MenuLink icon="mail-outline" title="Contact Us" onPress={() => navigation.navigate("ContactUs")} />
                <MenuLink icon="shield-outline" title="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy")} />
                <MenuLink icon="settings-outline" title="Settings" onPress={() => navigation.navigate("Settings")} />
            </View>

            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Avatar</Text>
                        <View style={styles.avatarGrid}>
                            {predefinedAvatars.map((avatar) => (
                                <TouchableOpacity
                                    key={avatar.id}
                                    style={styles.avatarOption}
                                    onPress={() => selectPredefinedAvatar(avatar)}
                                >
                                    <Image source={avatar.source} style={styles.avatarPreview} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={() => {
                                setShowAvatarModal(false);
                                pickImage();
                            }}
                        >
                            <Ionicons name="image" size={24} color="white" style={styles.uploadIcon} />
                            <Text style={styles.uploadButtonText}>Upload Custom Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowAvatarModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFFFFF",
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    profileSection: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        alignItems: "center",
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    },
    avatarContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        alignSelf: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
    },
    editIconContainer: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#ff758f',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 4,
    },
    program: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    editButton: {
        backgroundColor: "#6B8CFF",
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    editButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingTop: 20,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6B8CFF",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
    },
    section: {
        backgroundColor: "#FFFFFF",
        marginTop: 16,
        paddingVertical: 8,
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    },
    menuSection: {
        backgroundColor: "#FFFFFF",
        marginTop: 16,
        paddingVertical: 8,
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuItemContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuIcon: {
        marginRight: 12,
    },
    menuText: {
        fontSize: 16,
        color: "#333",
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 16,
    },
    menuButton: {
        padding: 10,
        position: 'absolute',
        right: 10,
        top: 10,
    },
    menuContainer: {
        position: 'absolute',
        right: 10,
        top: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 5,
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
        elevation: 5,
        zIndex: 1000,
    },
    dropdownMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    logoutButton: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 16,
    },
    logoutText: {
        color: '#FF6B6B',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    avatarOption: {
        margin: 10,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ff758f',
    },
    avatarPreview: {
        width: 80,
        height: 80,
    },
    uploadButton: {
        backgroundColor: '#ff758f',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        width: '100%',
        marginBottom: 10,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    uploadIcon: {
        marginRight: 4,
    },
    cancelButton: {
        padding: 12,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

export default Profile;
