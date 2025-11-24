import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  useColorScheme,
  Animated,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import DeviceInfo from "react-native-device-info";
import { useNavigation } from "@react-navigation/native";


//const API_URL = "http://172.17.15.132/Eenaduapi/api/imagedetails";
const API_URL = "https://api.eenadu.net/EenaduQuizApi/api/imagedetails";
const EENADU_IMAGE_SOURCE = require("../assets/images/eenadu.png");
const QUIZ_IMAGE_SOURCE = require("../assets/images/equiz.png");

export default function MyQuizScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();

  // Fetch records
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: { device_id: deviceId } }),
      });

      const json = await response.json();
      if (json.status === "1" && Array.isArray(json.message)) {
        setRecords(json.message);
      } else {
        Alert.alert("No Records Found", "No Quizs found for this device.");
        setRecords([]);
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch Quizs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImagePress = () => {
    setSelectedImage(QUIZ_IMAGE_SOURCE);
    setModalVisible(true);
  };

  // Floating Action Button (FAB)
  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsFabOpen(!isFabOpen);
  };

  // ✅ Only Home and My Quizs options
  const fabButtons = [
    {
      label: "Home",
      color: isDark ? "#22C55E" : "#10B981",
      icon: "house",
      offset: -70,
      onPress: () => navigation.navigate("LandingScreen"),
    },
    {
      label: "My Quizs",
      color: isDark ? "#A78BFA" : "#8B5CF6",
      icon: "clipboard-list",
      offset: -140,
      onPress: () => navigation.navigate("Myquizs"),
    },
  ];

  const FloatingActionButtonMenu = () => (
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
          opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        };

        return (
          <Animated.View key={idx} style={[styles.secondaryButton, animatedStyle]}>
            <TouchableOpacity
              style={[
                styles.fabButton,
                {
                  backgroundColor: btn.color,
                  width: 52,
                  height: 52,
                },
              ]}
              onPress={btn.onPress}
            >
              <FontAwesome6 name={btn.icon} size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          {
            backgroundColor: isDark ? "#2563EB" : "#3B82F6",
            width: 60,
            height: 60,
          },
        ]}
        onPress={toggleFab}
        activeOpacity={0.9}
      >
        <FontAwesome6 name={isFabOpen ? "xmark" : "plus"} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0B0B0B" : "#F5F7FA" },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome6
              name="chevron-left"
              size={20}
              color={isDark ? "#60A5FA" : "#007AFF"}
            />
          </TouchableOpacity>

          <View style={styles.logoTextContainer}>
            <Image source={EENADU_IMAGE_SOURCE} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.smartQuizText, { color: isDark ? "#E5E7EB" : "#111827" }]}>
              Smart Quiz
            </Text>
          </View>
        </View>

        <Text style={[styles.pageTitle, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
          My Quizs
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Loader */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={isDark ? "#60A5FA" : "#00adf2"} />
          <Text style={{ color: isDark ? "#E5E7EB" : "#000", marginTop: 10 }}>
            Fetching records...
          </Text>
        </View>
      ) : (
        <>
          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              { backgroundColor: isDark ? "#1F2937" : "#00adf2" },
            ]}
          >
            <Text style={[styles.headerText, { flex: 1 }]}>ID</Text>
            <Text style={[styles.headerText, { flex: 1.2 }]}>CAPTURE DATE</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>STATUS</Text>
            <Text style={[styles.headerText, { flex: 0.8 }]}>IMAGE</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {records.length > 0 ? (
              records.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.dataCard,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                      shadowColor: isDark ? "#000" : "#000",
                    },
                  ]}
                >
                  <View style={styles.dataRow}>
                    <Text
                      style={[
                        styles.dataCelluid,
                        { color: isDark ? "#E5E7EB" : "#222" },
                        { flex: 1, fontWeight: "460" },
                      ]}
                    >
                      {item.unique}
                    </Text>
                    <Text
                      style={[
                        styles.dataCell_capturedate,
                        { color: isDark ? "#E5E7EB" : "#222" },
                        { flex: 1.2, fontWeight: "650" },
                      ]}
                    >
                      {item.capturedate}
                    </Text>
                    <Text
                      style={[
                        styles.dataCell_status,
                        { color: isDark ? "#38BDF8" : "#007AFF" },
                        { flex: 1, fontWeight: "bold" },
                      ]}
                    >
                      {item.status}
                    </Text>

                    <TouchableOpacity
                      onPress={handleImagePress}
                      style={[styles.imageContainer, { flex: 0.8 }]}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={QUIZ_IMAGE_SOURCE}
                        style={styles.dataImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.noDataText,
                  { color: isDark ? "#9CA3AF" : "#555" },
                ]}
              >
                No records found for this device.
              </Text>
            )}
            <View style={{ height: 80 }} />
          </ScrollView>
        </>
      )}

      {/* FAB */}
      <FloatingActionButtonMenu />

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            <Image
              source={selectedImage}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: isDark ? "#1D4ED8" : "#00adf2" },
            ]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  leftHeader: { flexDirection: "row", alignItems: "center" },
  backButton: { paddingLeft: 10, marginTop: 20 },
  logoTextContainer: { alignItems: "center" },
  logo: { width: 80, height: 60, borderRadius: 6 },
  smartQuizText: { marginTop: -8, fontSize: 12, fontWeight: "bold" },
  pageTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 5,
    marginHorizontal: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 15,
  },
  dataCard: {
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 10,
    paddingVertical: 12,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dataCelluid: {
    height: 50,
    width: 120,
    fontSize: 13,
    textAlign: "center",
    textAlignVertical: "center",
  },
  dataCell_capturedate: {
    height: 50,
    width: 120,
    fontSize: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "sans-serif",
    fontWeight: "600",
  },
  dataCell_status: {
    height: 50,
    width: 120,
    fontSize: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "bold",
  },
  imageContainer: { alignItems: "center", justifyContent: "center" },
  dataImage: { width: 45, height: 45, borderRadius: 8 },
  fabContainer: { position: "absolute", bottom: 30, right: 25, alignItems: "center" },
  fabButton: {
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  secondaryButton: { position: "absolute", bottom: 0, right: 0 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "100%", height: "100%", borderRadius: 10 },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 30,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  closeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  noDataText: { textAlign: "center", marginTop: 40, fontSize: 16 },
});
