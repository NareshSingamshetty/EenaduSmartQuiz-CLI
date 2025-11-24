import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"; // ✅ use FontAwesome6

// Sample leaderboard data for 3 quizzes
const allLeaderboardData = {
  quiz1: [
    { id: "1", name: "Naresh", score: 95 },
    { id: "2", name: "Priya", score: 88 },
    { id: "3", name: "Ram", score: 82 },
  ],
  quiz2: [
    { id: "1", name: "Krishna", score: 90 },
    { id: "2", name: "Sneha", score: 85 },
    { id: "3", name: "Teja", score: 80 },
  ],
  quiz3: [
    { id: "1", name: "Abhi", score: 92 },
    { id: "2", name: "Pooja", score: 86 },
    { id: "3", name: "Vikram", score: 83 },
  ],
};

const Dashboard = () => {
  const [selectedQuiz, setSelectedQuiz] = useState("quiz1"); // default quiz

  const leaderboardData = allLeaderboardData[selectedQuiz].sort(
    (a, b) => b.score - a.score
  );
  const winner = leaderboardData[0];

  return (
    <View style={styles.container}>
      {/* Quiz Dropdown */}
      <Text style={styles.heading}>Select a Quiz</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedQuiz}
          onValueChange={(itemValue) => setSelectedQuiz(itemValue)}
          style={styles.picker}
        >
          {Object.keys(allLeaderboardData).map((quizId) => (
            <Picker.Item
              key={quizId}
              label={quizId.toUpperCase()}
              value={quizId}
            />
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
      <Text style={styles.leaderboardHeading}>🏆 Leaderboard</Text>
      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              index === 0 && styles.topRank,
            ]}
          >
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.scoreContainer}>
              <FontAwesome6 name="star" size={18} color="#FFD700" solid />
              <Text style={styles.score}>{item.score}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00adf2",
    marginBottom: 10,
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#00adf2",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#00adf2",
  },
  winnerBox: {
    backgroundColor: "#E0F7FA",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  congratsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00adf2",
    marginTop: 10,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  winnerScore: {
    fontSize: 16,
    color: "#555",
  },
  leaderboardHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00adf2",
    marginVertical: 10,
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00adf2",
    width: 40,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    marginLeft: 4,
    fontSize: 16,
    color: "#555",
  },
  topRank: {
    backgroundColor: "#D1F2EB",
  },
});
