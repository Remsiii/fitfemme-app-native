import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { CheckCircle, ChevronLeft, ChevronRight } from "react-native-feather";
import { supabase } from "@/lib/supabase";

interface GoalsQuestionnaireProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const GoalsQuestionnaire = ({ open, onOpenChange }: GoalsQuestionnaireProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        fitness_goal: "",
        weekly_workout_days: 3,
        preferred_workout_time: "",
        fitness_level: "",
        health_conditions: [],
        target_weight: "",
        dietary_preferences: [],
    });

    const steps = [
        {
            title: "Was ist dein Hauptziel?",
            component: (
                <View style={styles.optionList}>
                    {[
                        { id: "weight_loss", label: "Gewichtsverlust" },
                        { id: "muscle_gain", label: "Muskelaufbau" },
                        { id: "endurance", label: "Ausdauer verbessern" },
                        { id: "flexibility", label: "Flexibilität verbessern" },
                    ].map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.optionCard,
                                formData.fitness_goal === goal.id && styles.selectedOption,
                            ]}
                            onPress={() =>
                                setFormData((prev) => ({ ...prev, fitness_goal: goal.id }))
                            }
                        >
                            <Text style={styles.optionText}>{goal.label}</Text>
                            {formData.fitness_goal === goal.id && (
                                <CheckCircle color="green" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ),
        },
        {
            title: "Wie oft möchtest du trainieren?",
            component: (
                <View style={styles.optionList}>
                    {[2, 3, 4, 5].map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.optionCard,
                                formData.weekly_workout_days === day && styles.selectedOption,
                            ]}
                            onPress={() =>
                                setFormData((prev) => ({ ...prev, weekly_workout_days: day }))
                            }
                        >
                            <Text style={styles.optionText}>{day} Tage</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ),
        },
        {
            title: "Wann trainierst du am liebsten?",
            component: (
                <View style={styles.optionList}>
                    {[
                        { id: "morning", label: "Morgens" },
                        { id: "afternoon", label: "Nachmittags" },
                        { id: "evening", label: "Abends" },
                    ].map((time) => (
                        <TouchableOpacity
                            key={time.id}
                            style={[
                                styles.optionCard,
                                formData.preferred_workout_time === time.id &&
                                styles.selectedOption,
                            ]}
                            onPress={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    preferred_workout_time: time.id,
                                }))
                            }
                        >
                            <Text style={styles.optionText}>{time.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ),
        },
        {
            title: "Was ist dein Zielgewicht?",
            component: (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Zielgewicht (kg)"
                        keyboardType="numeric"
                        value={formData.target_weight}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, target_weight: text }))
                        }
                    />
                </View>
            ),
        },
    ];

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { error } = await supabase
                    .from("profiles")
                    .update(formData)
                    .eq("id", user.id);

                if (error) throw error;

                Alert.alert("Success", "Data saved successfully!");
                onOpenChange(false);
            } catch (error) {
                Alert.alert("Error", "Could not save your data.");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    if (!open) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <View style={styles.stepContent}>{steps[currentStep].component}</View>
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, currentStep === 0 && styles.disabled]}
                    onPress={handleBack}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft color={currentStep === 0 ? "gray" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
                    <ChevronRight />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    stepContent: { marginBottom: 20 },
    optionList: { gap: 10 },
    optionCard: {
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedOption: { backgroundColor: "#d0f0d0" },
    optionText: { fontSize: 16 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    controlButton: {
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
    },
    disabled: {
        backgroundColor: "#f0f0f0",
    },
});

export default GoalsQuestionnaire;
