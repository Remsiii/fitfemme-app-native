import {
  View,
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Modal,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";
import { HEIGHT, WIDTH } from "@/configs/constants";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useRouter } from "expo-router";
import {
  fontSizes,
  SCREEN_WIDTH,
  windowHeight,
  windowWidth,
} from "@/themes/app.constant";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
// import AuthModal from "../auth/auth.modal";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

interface onBoardingSlidesTypes {
  title: string;
  secondTitle: string;
  subTitle: string;
  color: string;
  image: React.ReactNode;
  animate?: boolean;
}

export default function Slide({
  slide,
  index,
  setIndex,
  totalSlides,
}: {
  slide: onBoardingSlidesTypes;
  index: number;
  setIndex: (value: number) => void;
  totalSlides: number;
}) {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter()
  
  // NEW: typed states for title & secondTitle when animation is enabled
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSecond, setTypedSecond] = useState("");

  // NEW: typewriter effect if slide.animate is true
  useEffect(() => {
    let titleTimeout: NodeJS.Timeout | null = null;
    let secondTimeout: NodeJS.Timeout | null = null;

    setTypedTitle("");
    setTypedSecond("");

    if (slide.animate) {
      const fullTitle = slide.title || "";
      const fullSecond = slide.secondTitle || "";

      const typeTitle = (i: number) => {
        if (i < fullTitle.length) {
          setTypedTitle(prev => prev + fullTitle[i]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          titleTimeout = setTimeout(() => typeTitle(i + 1), 100);
        }
      };

      const typeSecond = (i: number) => {
        if (i < fullSecond.length) {
          setTypedSecond(prev => prev + fullSecond[i]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(() => typeSecond(i + 1), 100);
        }
      };

      typeTitle(0);
      // Start second title after first title finishes
      secondTimeout = setTimeout(() => {
        typeSecond(0);
      }, 300 + fullTitle.length * 100);
    }
    return () => {
      if (titleTimeout) clearTimeout(titleTimeout);
      if (secondTimeout) clearTimeout(secondTimeout);
    };
  }, [slide.animate, slide.title, slide.secondTitle]);

  const handlePress = (index: number, setIndex: (index: number) => void) => {
    if (index === totalSlides - 1) {
      // Navigate to register/login screen at end
      router.push("/register") // Adjust route name as needed
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="gradient" cx="50%" cy="35%">
            <Stop offset="0%" stopColor={slide.color} />
            <Stop offset="100%" stopColor={slide.color} />
          </RadialGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          fill={"url(#gradient)"}
        />
      </Svg>
      <View style={styles.container}>
        <View>{slide.image}</View>
        <View>
          <View
            style={{
              width: SCREEN_WIDTH * 1,
              paddingHorizontal: verticalScale(25),
              alignSelf: 'center', // Add this line to center the content
            }}
          >
            {/* Display the animated title only if slide.animate is true */}
            <Text
              style={{
                fontSize: fontSizes.FONT30,
                fontWeight: "600",
                color: "#05030D",
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {slide.animate ? typedTitle : slide.title}
            </Text>
            <Text
              style={{
                fontSize: fontSizes.FONT30,
                fontWeight: "600",
                color: "#05030D",
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {slide.animate ? typedSecond : slide.secondTitle}
            </Text>
            {/* Fixed subTitle Text with fallback */}
            <Text style={{ paddingVertical: verticalScale(4) }}>
              {slide.subTitle || ""}
            </Text>
            {/* Next Button */}
            {index <= totalSlides - 1 && (
              <LinearGradient
                colors={["#6D55FE", "#8976FC"]}
                style={styles.nextButton}
              >
                <Pressable
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  onPress={() => handlePress(index, setIndex)}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </Pressable>
              </LinearGradient>
            )}
            {index < totalSlides - 1 && (
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => handlePress(index, setIndex)}
              >
                <Ionicons
                  name="chevron-forward-outline"
                  size={scale(18)}
                  color="black"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)}>
          {/* <AuthModal setModalVisible={setModalVisible} /> */}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: scale(60),
    paddingTop: verticalScale(100),
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: verticalScale(35),
    position: "absolute",
    bottom: verticalScale(55),
    left: scale(22),
  },
  indicator: {
    height: verticalScale(7),
    width: scale(18),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: scale(4),
    borderRadius: scale(4),
  },
  activeIndicator: {
    height: verticalScale(7),
    width: scale(35),
    backgroundColor: "white",
  },
  nextButton: {
    position: "absolute",
    zIndex: 999999999,
    right: windowWidth(25),
    bottom: windowHeight(-100), // reduced bottom value to push button lower
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth(140),
    height: windowHeight(37),
    borderRadius: windowWidth(20),
  },
  nextButtonText: {
    color: "white",
    fontSize: fontSizes.FONT22,
    fontWeight: "bold",
  },
  arrowButton: {
    position: "absolute",
    width: scale(30),
    height: scale(30),
    borderRadius: scale(20),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    right: moderateScale(5),
    top: Platform.OS === "ios" ? verticalScale(345) : verticalScale(385),
    transform: [{ translateY: -30 }],
  },
});
