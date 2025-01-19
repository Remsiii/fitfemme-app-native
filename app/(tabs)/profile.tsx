import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';

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
    const [profile, setProfile] = useState<{
        name: string;
        email: string;
        avatar_url: string;
        age: string | number;
        weight: string | number;
        height: string | number;
        goal: string;
        birth_date?: string | null;
    }>({
        name: "New User",
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

    useFocusEffect(
        React.useCallback(() => {
            checkAdminStatus();
            fetchProfile();
        }, [])
    );

    const checkAdminStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setIsAdmin(data?.is_admin || false);
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data: authUser, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser?.user) {
                navigation.navigate("login");
                throw new Error("User is not authenticated");
            }

            const userId = authUser.user.id;

            const { data: profileData, error: dbError } = await supabase
                .from("users")
                .select("full_name, email, profile_picture_url, age, weight, height, goal, birth_date")
                .eq("id", userId)
                .maybeSingle();

            if (dbError) {
                console.error("Database error:", dbError);
                throw dbError;
            }

            if (profileData) {
                const calculatedAge = profileData.age || calculateAge(profileData.birth_date);
                setProfile({
                    name: profileData.full_name || "New User",
                    email: profileData.email || "",
                    avatar_url: profileData.profile_picture_url || "",
                    age: calculatedAge || "N/A",
                    weight: profileData.weight || "N/A",
                    height: profileData.height || "N/A",
                    goal: profileData.goal || "No specific goal",
                    birth_date: profileData.birth_date
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert(
                "Error",
                "Could not load profile. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigation.replace('login');
        } catch (error) {
            Alert.alert('Error', 'Failed to log out');
        }
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
                        handleLogout();
                    }}>
                    <Ionicons name="log-out-outline" size={20} color="#FF0000" />
                    <Text style={[styles.menuItemText, { color: '#FF0000' }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6B8CFF" />
            </View>
        );
    }

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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                {/* <Text style={styles.headerTitle}>Profile</Text> */}
                {renderThreeDotsMenu()}
            </View>
            {renderMenu()}
            <ScrollView style={styles.scrollView}>
                <View style={styles.profileSection}>
                    <Image
                        source={profile.avatar_url ? { uri: profile.avatar_url } : require("../../assets/images/react-logo.png")}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{profile.name}</Text>
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
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
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
    scrollView: {
        flex: 1,
    }
});

export default Profile;
