import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import DeviceInfo from "react-native-device-info";

const { width } = Dimensions.get("window");
const GRID_ITEM_WIDTH = width / 3 - 20;

// Static slides
const originalSlides = [
  
  { title: "Rewards" },
  { title: "Daily Quiz" },
 // { title: "Weekly Challenge" },
];

// Static image imports
const rewardImage = require("../assets/images/rewards4.jpeg");

export default function LandingScreen() {
  const navigation = useNavigation();
  const { colors, dark } = useTheme();
  const flatListRef = useRef(null);

  const [carouselSlides, setCarouselSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [loading, setLoading] = useState(true);

  // --- API Fetch Logic (POST Request) ---
  useEffect(() => {
    const fetchLatestRecord = async () => {
      let rawText = "";
      //const url = `http://172.17.15.132/Eenaduapi/api/getlastest_record`;
      const url = `https://api.eenadu.net/EenaduQuizApi/api/getlastest_record`;

      try {
        const deviceId = await DeviceInfo.getUniqueId();

        const postBody = {
          params: {
            device_id: deviceId,
          },
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postBody),
        });

        rawText = await response.text();

        let result;
        try {
          result = JSON.parse(rawText);
        } catch (e) {
          console.log("JSON parse error:", e.message);
          Alert.alert("Error", `Received invalid JSON. Check server logs.`);
          throw new Error(`Invalid JSON received.`);
        }

        let latestSlide;

        if (result && Array.isArray(result.message) && result.message.length > 0) {
          const first = result.message[0];
          latestSlide = {
            title: "Your Latest QUIZ Submission",
            description: `Captured on: ${first.capturedate || "N/A"}`,
            date: first.capturedate || "",
            status: first.status || "N/A",
            unique_id: first.unique || "N/A",
            isLatest: true, // 🔹 mark this slide so we can detect it
          };
        } else {
          console.log("No valid record found in API response");
          latestSlide = { title: "No Recent Record Found" };
        }

        // Setup slides for infinite loop
        const updatedSlides = [latestSlide, ...originalSlides];
        const loopingSlides = [
          updatedSlides[updatedSlides.length - 1],
          ...updatedSlides,
          updatedSlides[0],
        ];

        setCarouselSlides(loopingSlides);
      } catch (error) {
        console.error("API Fetch Error:", error.message);
        Alert.alert("Error", error.message || "Network request failed. Check connection/IP.");

        const fallbackSlides = [
          originalSlides[originalSlides.length - 1],
          ...originalSlides,
          originalSlides[0],
        ];
        setCarouselSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRecord();
  }, []);

  // --- Infinite loop carousel logic ---
  const onMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);

    if (index === 0) {
      flatListRef.current.scrollToIndex({ index: carouselSlides.length - 2, animated: false });
      setCurrentIndex(carouselSlides.length - 2);
    } else if (index === carouselSlides.length - 1) {
      flatListRef.current.scrollToIndex({ index: 1, animated: false });
      setCurrentIndex(1);
    }
  };

  // --- Render ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../assets/images/eenadu.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Smart Quiz</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.notificationIcon,
            { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
          ]}
          onPress={() => navigation.navigate("Notifications")}
        >
          <FontAwesome6 name="bell" size={22} color={dark ? "#00adf2" : "#007AFF"} />
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : carouselSlides.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={carouselSlides}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            initialScrollIndex={1}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            renderItem={({ item }) => {
              const isRewards = item.title === "Rewards";
              const isClickable = item.isLatest === true; // 🔹 check if this is the latest submission slide

              const SlideWrapper = isClickable ? TouchableOpacity : View;

              return (
                <SlideWrapper
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isClickable) {
                      navigation.navigate("Myquizs");
                    }
                  }}
                  style={[
                    styles.carouselCard,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.card,
                      shadowColor: dark ? "#00adf2" : "#000",
                    },
                  ]}
                >
                  {isRewards ? (
                    <Image
                      source={rewardImage}
                      style={styles.fullSlideImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.slideContent}>
                      <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>

                      {item.description && (
                        <Text style={[styles.slideDescription, { color: colors.text, fontWeight:'480' }]}>
                          {item.description}
                        </Text>
                      )}

                      <View style={styles.infoBox}>
                        {/*
                          {item.date ? (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📅 Date:</Text>
                            <Text style={[styles.infoValue, { color: colors.text,  }]}>{item.date}</Text>
                          </View>
                        ) : null}
                          */}

                        {item.status ? (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🟢 Status:</Text>
                            <Text style={[styles.infoValue, { color: colors.text, color:'green', fontSize:15}]}>{item.status}</Text>
                          </View>
                        ) : null}

                        {item.unique_id ? (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🔖 UID:</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.unique_id}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                  )}
                </SlideWrapper>
              );
            }}
          />
        ) : (
          <Text style={{ color: colors.text, marginTop: 60 }}>No data to display</Text>
        )}
      </View>

      {/* Grid Buttons */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: "#00adf2" }]}
          onPress={() => navigation.navigate("VisionCamera")}
        >
          <FontAwesome6 name="camera" size={28} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={styles.gridText}>Participate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: "#3B82F6" }]}
          onPress={() => navigation.navigate("Myquizs")}
        >
          <FontAwesome6 name="clipboard-list" size={28} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={styles.gridText}>My Quizs</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 40, alignItems: "center" },
  header: {
    position: "absolute",
    top: 10,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerImage: { width: 100, height: 60, borderRadius: 12 },
  headerTitle: { textAlign: "center", fontWeight: "bold", fontSize: 18 },
  notificationIcon: { padding: 8, borderRadius: 20 },
  carouselContainer: { marginTop: 80, height: 340 },
  carouselCard: {
    width: width - 40,
    height: 320,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.6,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden",
  },
  fullSlideImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  infoBox: {
    marginTop: 10,
    width: "90%",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    padding: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },

  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "#00adf2",
    width: "40%",
    textAlign: "left",
  },

  infoValue: {
    fontSize: 14,
    width: "55%",
    textAlign: "right",
    fontWeight:'bold'
  },

  slideTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  slideMeta: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.8,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "98%",
    padding: 3,
    marginTop: 20,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  gridText: { color: "#fff", fontWeight: "bold", fontSize: 14, textAlign: "center" },
});
