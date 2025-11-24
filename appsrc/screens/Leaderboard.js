import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";

// Sample leaderboard data
const allLeaderboardData = {
  "2025-10-21": [
    { id: "1", name: "Naresh", score: 95 },
    { id: "2", name: "Priya", score: 88 },
    { id: "3", name: "Ram", score: 82 },
  ],
  "2025-10-22": [
    { id: "1", name: "Krishna", score: 90 },
    { id: "2", name: "Sneha", score: 85 },
    { id: "3", name: "Teja", score: 80 },
  ],
  "2025-10-23": [
    { id: "1", name: "Abhi", score: 92 },
    { id: "2", name: "Pooja", score: 86 },
    { id: "3", name: "Vikram", score: 83 },
  ],
};

export default function Leaderboard() {
  const [selectedDate, setSelectedDate] = useState("2025-10-21");
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const leaderboardData = allLeaderboardData[selectedDate].sort(
    (a, b) => b.score - a.score
  );
  const winner = leaderboardData[0];

  // FAB state & animation
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    Animated.spring(animation, { toValue, useNativeDriver: true }).start();
    setIsFabOpen(!isFabOpen);
  };

  // FAB buttons configuration
  const fabButtons = [
    {
      label: "Home",
      color: "#10B981",
      icon: "house",
      offset: -40,
      onPress: () => navigation.navigate("LandingScreen"),
    },
    {
      label: "My Quizs",
      color: "#8B5CF6",
      icon: "clipboard-list",
      offset: -100,
      onPress: () => navigation.navigate("Myquizs"),
    },
    {
      label: "Leaderboard",
      color: "#3B82F6",
      icon: "chart-line",
      offset: -160,
      onPress: () => navigation.navigate("Leaderboard"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0D0D0D" : "#F5F7FA" }]}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.leftHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6
              name="chevron-left"
              size={20}
              color={isDark ? "#FFFFFF" : "#00adf2"}
            />
          </TouchableOpacity>

          <View style={styles.logoTextContainer}>
            <Image
              source={require("../assets/images/eenadu.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[styles.smartQuizText, { color: isDark ? "#FFFFFF" : "#111827" }]}
            >
              Smart Quiz
            </Text>
          </View>
        </View>

        <Text style={[styles.pageTitle, { color: isDark ? "#FFFFFF" : "#00adf2" }]}>
          🏆 Leaderboard
        </Text>
      </View>

      {/* Quiz Date Dropdown */}
      <Text style={[styles.heading, { color: isDark ? "#FFFFFF" : "#00adf2" }]}>
        📅 Select Quiz Date
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDate}
          onValueChange={(itemValue) => setSelectedDate(itemValue)}
          style={[styles.picker, { color: isDark ? "#FFFFFF" : "#00adf2" }]}
        >
          {Object.keys(allLeaderboardData).map((date) => (
            <Picker.Item key={date} label={date} value={date} />
          ))}
        </Picker>
      </View>

      {/* Winner Box */}
      <View style={styles.winnerBox}>
        <FontAwesome6 name="crown" size={40} color="#FFD700" solid />
        <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
        <Text style={styles.winnerName}>
          {winner.name} - Rank #1 🥇
        </Text>
        <Text style={styles.winnerScore}>Score: {winner.score}</Text>
      </View>

      {/* Leaderboard List */}
      <Text style={[styles.leaderboardHeading, { color: isDark ? "#FFFFFF" : "#00adf2" }]}>
        🏆 Leaderboard
      </Text>
      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.listItem, index === 0 && styles.topRank]}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.scoreContainer}>
              <FontAwesome6 name="star" size={18} color="#FFD700" solid />
              <Text style={styles.score}>{item.score}</Text>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {fabButtons.map((btn, idx) => {
          const animatedStyle = {
            transform: [
              { scale: animation },
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, btn.offset],
                }),
              },
            ],
            opacity: animation,
          };

          return (
            <Animated.View
              key={idx}
              style={[styles.secondaryButton, animatedStyle]}
            >
              <TouchableOpacity
                style={[styles.fabButton, { backgroundColor: btn.color }]}
                onPress={btn.onPress}
              >
                <FontAwesome6 name={btn.icon} size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: "#2563EB" }]}
          onPress={toggleFab}
        >
          <FontAwesome6
            name={isFabOpen ? "xmark" : "plus"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  
  // Header
  headerContainer: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    //paddingLeft: 10,
  },
  backButton: {   marginTop:20, paddingLeft:10 },
  logoTextContainer: { alignItems: "center" },
  logo: { width: 80, height: 60, borderRadius: 6 },
  smartQuizText: { fontSize: 12, fontWeight: "bold", marginTop: -8 },
  pageTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center" },

  // Picker & Heading
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  pickerContainer: { borderWidth: 1, borderColor: "#00adf2", borderRadius: 10, marginBottom: 20, overflow: "hidden" },
  picker: { height: 50, width: "100%" },

  // Winner box
  winnerBox: { backgroundColor: "#E0F7FA", borderRadius: 15, padding: 20, alignItems: "center", marginBottom: 20, elevation: 3 },
  congratsText: { fontSize: 20, fontWeight: "bold", color: "#00adf2", marginTop: 10 },
  winnerName: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 4 },
  winnerScore: { fontSize: 16, color: "#555" },

  // Leaderboard list
  leaderboardHeading: { fontSize: 20, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
  listItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginVertical: 6, padding: 12, borderRadius: 10, elevation: 2 },
  rank: { fontSize: 18, fontWeight: "bold", color: "#00adf2", width: 40 },
  name: { flex: 1, fontSize: 16, color: "#333" },
  scoreContainer: { flexDirection: "row", alignItems: "center" },
  score: { marginLeft: 4, fontSize: 16, color: "#555" },
  topRank: { backgroundColor: "#D1F2EB" },

  // FAB
  fabContainer: { position: "absolute", bottom: 30, right: 25, alignItems: "center" },
  fabButton: { width: 55, height: 55, borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4 },
  secondaryButton: { position: "absolute", bottom: 0, right: 0 },
});
