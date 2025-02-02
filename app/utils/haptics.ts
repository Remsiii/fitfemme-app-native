import * as Haptics from 'expo-haptics';

export const triggerButtonHaptic = async () => {
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
        // Silently fail if haptics is not available
        console.log('Haptics not available');
    }
}; 