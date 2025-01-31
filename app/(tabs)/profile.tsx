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
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
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
    const [isAdmin, setIsAdmin] = useState(false);
    const { isLoading: authLoading, isAuthenticated, handleLogout } = useAuthProtection();
    const [profile, setProfile] = useState<{
        full_name: string;
        email: string;
        profile_picture_url: string;
        age: string | number;
        weight: string | number;
        height: string | number;
        goal: string;
        birth_date?: string | null;
    }>({
        full_name: "New User",
        email: "",
        profile_picture_url: "",
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
                throw new Error('Kein authentifizierter User gefunden.');
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            const age = data.birth_date ? calculateAge(data.birth_date) : "N/A";

            setProfile({
                full_name: data.full_name || "New User",
                email: data.email || "",
                profile_picture_url: data.profile_picture_url || "",
                age: age || "N/A",
                weight: data.weight ? `${data.weight} kg` : "N/A",
                height: data.height ? `${data.height} cm` : "N/A",
                goal: data.fitness_goal || "No specific goal",
                birth_date: data.birth_date
            });

            setIsAdmin(data.is_admin || false);
        } catch (error) {
            console.error('Fehler beim Laden des Profils:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Entschuldigung, wir benötigen Kamera-/Bibliothekszugriff.');
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
                setIsLoading(true);

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const filePath = `${user.id}/${new Date().getTime()}.jpg`;
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
                    .eq('id', user.id);

                if (updateError) throw updateError;

                setProfile(prev => prev ? { ...prev, profile_picture_url: publicUrl } : null);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Fehler beim Hochladen des Bildes:', error);
            Alert.alert('Fehler', 'Bild konnte nicht hochgeladen werden.');
            setIsLoading(false);
        }
    };

    const selectPredefinedAvatar = async (avatar: { id?: string; source: any; }) => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kein User gefunden.');

            // Avatar in der Datenbank aktualisieren
            const { error: updateError } = await supabase
                .from('users')
                .update({ profile_picture_url: avatar.source })
                .eq('id', user.id)
                .select();

            if (updateError) throw updateError;

            setProfile(prev => ({
                ...prev,
                profile_picture_url: avatar.source
            }));

            setShowAvatarModal(false);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Avatars:', error);
            Alert.alert('Fehler', 'Avatar konnte nicht aktualisiert werden.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoutPress = () => {
        Alert.alert(
            "Logout",
            "Möchtest du dich wirklich abmelden?",
            [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Logout",
                    onPress: handleLogout,
                    style: "destructive"
                }
            ]
        );
    };

    // Kleiner Helfer, um Navigations-Links als Komponente zu kapseln
    const MenuLink = ({ icon, title, onPress }: { icon: string, title: string, onPress: () => void }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon as any} size={24} color="#666" style={styles.menuIcon} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    if (authLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C9EFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>

            {/* Profil-Bereich */}
            <View style={styles.profileSection}>
                <TouchableOpacity onPress={handleImageUpload} disabled={isLoading}>
                    {profile.profile_picture_url ? (
                        <Image
                            source={{ uri: profile.profile_picture_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                            <Text style={styles.avatarText}>
                                {profile.full_name?.charAt(0) || 'U'}
                            </Text>
                        </View>
                    )}
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color="#ffffff" />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.name}>{profile.full_name}</Text>
                <Text style={styles.program}>{profile.goal}</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push('/edit-profile')}
                >
                    <Text style={styles.editButtonText}>Bearbeiten</Text>
                </TouchableOpacity>

                {/* Statistiken */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.height}</Text>
                        <Text style={styles.statLabel}>Größe</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.weight}</Text>
                        <Text style={styles.statLabel}>Gewicht</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.age}</Text>
                        <Text style={styles.statLabel}>Alter</Text>
                    </View>
                </View>
            </View>

            {/* Account-Einstellungen */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <MenuLink icon="person-outline" title="Persönliche Daten" onPress={() => navigation.navigate("PersonalData")} />
                <MenuLink icon="trophy-outline" title="Erfolge" onPress={() => navigation.navigate("Achievement")} />
                <MenuLink icon="time-outline" title="Aktivitäten" onPress={() => navigation.navigate("ActivityHistory")} />
                <MenuLink icon="fitness-outline" title="Trainings-Fortschritt" onPress={() => navigation.navigate("WorkoutProgress")} />
            </View>

            {/* Notifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benachrichtigungen</Text>
                <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                        <Ionicons name="notifications-outline" size={24} color="#666" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Pop-up Nachrichten</Text>
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
                        <Text style={styles.menuText}>Haptisches Feedback</Text>
                    </View>
                    <Switch
                        value={hapticEnabled}
                        onValueChange={toggleHaptic}
                        trackColor={{ false: "#D1D1D6", true: "#6B8CFF" }}
                        thumbColor={"#FFFFFF"}
                    />
                </View>
            </View>

            {/* Menü-Sektion */}
            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Menü</Text>
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/admin')}
                    >
                        <View style={styles.menuItemContent}>
                            <Ionicons name="settings-outline" size={24} color="#333" />
                            <Text style={styles.menuItemText}>Admin-Dashboard</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                )}
                <MenuLink icon="mail-outline" title="Kontakt" onPress={() => navigation.navigate("ContactUs")} />
                <MenuLink icon="shield-outline" title="Datenschutz" onPress={() => navigation.navigate("PrivacyPolicy")} />
                <MenuLink icon="settings-outline" title="Einstellungen" onPress={() => navigation.navigate("Settings")} />

                {/* Logout direkt hier als letztes Menu-Item */}
                <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
                    <View style={styles.menuItemContent}>
                        <Ionicons name="log-out-outline" size={24} color="#FF0000" />
                        <Text style={[styles.menuItemText, { color: '#FF0000' }]}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modal für Avatarauswahl */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Wähle einen Avatar</Text>
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
                                handleImageUpload();
                            }}
                        >
                            <Ionicons name="image" size={24} color="white" style={styles.uploadIcon} />
                            <Text style={styles.uploadButtonText}>Eigenes Bild hochladen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowAvatarModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Abbrechen</Text>
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
        backgroundColor: "#F5F5F5",
        paddingBottom: 40,
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
        // kleiner Shadow-Effekt
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    profileSection: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 40,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    menuSection: {
        backgroundColor: "#FFFFFF",
        marginTop: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
        marginBottom: 30, // Increased bottom margin
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
