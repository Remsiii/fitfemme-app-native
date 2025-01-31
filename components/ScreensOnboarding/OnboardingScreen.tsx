import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import {
    View,
    Text,
    Image,
    Dimensions,
    FlatList,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
} from 'react-native';

// Maße für die Slides
const { width } = Dimensions.get('window');

// Beispiel-Daten für deine Slides
// Ersetze die 'require(...)' Pfade durch deine Illustrationen/Bilder
const SLIDES = [
    {
        id: '1',
        title: 'Eat Well',
        description:
            "Let's start a healthy lifestyle with us, we can determine your diet every day. healthy eating is fun",
        image: require('../../assets/images/andree.jpg'), // Beispiel: dein Bildpfad
    },
    {
        id: '2',
        title: 'Get Burn',
        description:
            "Let's keep burning to achieve your goals. It hurts only temporarily, if you give up now, you'll be in pain forever",
        image: require('../../assets/images/andree.jpg'),
    },
    {
        id: '3',
        title: 'Track Your Goal',
        description:
            "Don't worry if you have trouble determining your goals, we help you track and reach them",
        image: require('../../assets/images/andree.jpg'),
    },
    {
        id: '4',
        title: 'FitnessX',
        description: 'Everybody Can Train',
        image: require('../../assets/images/andree.jpg'),
    },
];

// Ein Slide als eigene Komponente
type SlideItemProps = {
    item: typeof SLIDES[0];
    fadeAnim: Animated.Value;
};
function SlideItem({ item, fadeAnim }: SlideItemProps) {
    return (
        <View style={[styles.slideContainer, { width }]}>
            {/* Bild */}
            <Image source={item.image} style={styles.imageStyle} resizeMode="contain" />
            {/* Text */}
            <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
        </View>
    );
}

// Haupt-Onboarding-Component
export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fürs automatische Scrollen
    const flatListRef = useRef<FlatList>(null);

    // Fade-Animation
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Wenn man auf "Weiter" drückt
    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            // Erst animiert der Text weg
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => {
                // Nach Animation: scroll zum nächsten Slide
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
                setCurrentIndex((prev) => prev + 1);

                // Dann Text wieder einfaden
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            // Hier könntest du z.B. zu deinem Home-Screen navigieren
            console.log('Onboarding beendet – jetzt zur Haupt-App navigieren');
            router.replace('/(tabs)/index');
        }
    };

    // Damit wir den aktuellen Index updaten, wenn man swipet
    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(slideIndex);
    };

    // Render-Funktion für die FlatList
    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return <SlideItem item={item} fadeAnim={fadeAnim} />;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={SLIDES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                ref={flatListRef}
            />
            {/* Button für "Weiter" oder "Get Started" */}
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Weiter'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slideContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    imageStyle: {
        width: '70%',
        height: '50%',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
    button: {
        backgroundColor: '#6CACE4',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        // Schatten (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        // Schatten (Android)
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
