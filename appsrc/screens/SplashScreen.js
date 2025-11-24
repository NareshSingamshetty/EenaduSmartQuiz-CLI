import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors, dark } = useTheme(); // ✅ Access current theme
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      navigation.replace("LandingScreen");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Animated.Image
        source={
          dark
            ? require("../assets/images/eenadu.png") // optional dark version
            : require("../assets/images/eenadu.png")
        }
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />

      <Text style={[styles.appName, { color: colors.text }]}>
        Smart Quiz Scanner
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },
});
