import React, { useState, useEffect } from "react";
import { Platform, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { onBoardingSlides } from "@/configs/constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Slider from "./onboarding/slider";
import Slide from "./onboarding/slide";
import * as Haptics from 'expo-haptics';

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState("ro");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const prev = onBoardingSlides[index - 1];
    const next = onBoardingSlides[index + 1];

    useEffect(() => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [index]);

    const toggleDropdown = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDropdownVisible(!dropdownVisible);
    };

    const selectLanguage = (lang: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedLanguage(lang);
        setDropdownVisible(false);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Slider
                key={index}
                index={index}
                setIndex={setIndex}
                prev={
                    prev && (
                        <Slide
                            index={index}
                            setIndex={setIndex}
                            slide={prev}
                            totalSlides={onBoardingSlides.length}
                        />
                    )
                }
                next={
                    next && (
                        <Slide
                            index={index}
                            setIndex={setIndex}
                            slide={next}
                            totalSlides={onBoardingSlides.length}
                        />
                    )
                }
            >
                <Slide
                    slide={onBoardingSlides[index]}
                    index={index}
                    setIndex={setIndex}
                    totalSlides={onBoardingSlides.length}
                />
            </Slider>

            <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
                    <Text style={styles.languageText}>
                        {selectedLanguage === 'ro' ? '🇷🇴' : '🇬🇧'}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
                {dropdownVisible && (
                    <View style={styles.dropdownOptions}>
                        <TouchableOpacity style={styles.option} onPress={() => selectLanguage('ro')}>
                            <Text style={styles.languageText}>🇷🇴 Română</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => selectLanguage('en')}>
                            <Text style={styles.languageText}>🇬🇧 English</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageContainer: {
        position: "absolute",
        top: 0, // Adjust as needed so that it touches the notch
        left: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 5,
        borderRadius: 10,
    },
    languageIcon: {
        alignItems: "center",
        marginRight: 10,
        padding: 5,
    },
    selectedLanguage: {
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
    },
    languageText: {
        fontSize: 20,
    },
    languageLabel: {
        fontSize: 12,
    },
    languagePicker: {
        height: 50,
        width: 150,
    },
    iconButton: {
        padding: 10,
        // Add styling for the icon button
    },
    dropdownContainer: {
        position: "absolute",
        top: 50, // adjusted further down to avoid the notch
        left: 10,
        width: 90, // reduced width so icon and arrow fit better
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 8,
        elevation: 3, // adds shadow on Android
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        // Remove space-between and center content for tighter grouping:
        justifyContent: "center",
    },
    dropdownIcon: {
        marginLeft: 2, // further reduced space between flag and dropdown arrow
        fontSize: 12,
    },
    dropdownOptions: {
        borderTopWidth: 1,
        borderColor: "#ccc",
    },
    option: {
        padding: 8,
    },
    // New animated header styles
    animatedHeader: {
        position: "absolute",
        top: 100, // adjust vertical position as needed
        left: 10,
        right: 10,
        alignItems: "center",
    },
    headerText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
    },
    subText: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
});
