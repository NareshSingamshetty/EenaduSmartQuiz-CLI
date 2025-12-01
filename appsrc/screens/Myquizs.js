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

// YOUR WORKING PROXY
const IMAGE_PROXY_URL = "http://10.0.3.153/Crons/uploadview.php";

const EENADU_LOGO = require("../assets/images/eenadu.png");

export default function MyQuizScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnim = new Animated.Value(0);

  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();

  const getImageUrl = (record) => {
    const url = record.imageurl || record.image_url || record.ImageUrl || "";
    if (!url || url.trim() === "") return null;
    return `${IMAGE_PROXY_URL}?imgurl=${encodeURIComponent(url)}&t=${Date.now()}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const response = await fetch("https://api.eenadu.net/EenaduQuizApi/api/imagedetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: { device_id: deviceId } }),
      });

      const json = await response.json();

      if (json.status === "1" && Array.isArray(json.message)) {
        setRecords(json.message);
        console.log("API Response Sample:", json.message);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Cannot load quizzes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const toggleFab = () => {
    Animated.spring(fabAnim, {
      toValue: isFabOpen ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsFabOpen(!isFabOpen);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0a0a0a" : "#f8f9fa" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={24} color={isDark ? "#60a5fa" : "#007AFF"} />
        </TouchableOpacity>
        <View style={styles.logoBox}>
          <Image source={EENADU_LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.logoText, { color: isDark ? "#e5e7eb" : "#111" }]}>Smart Quiz</Text>
        </View>
       <View style = {{ flex: 1, alignItems: "center" }}>
        <Text style={[styles.title, { color: isDark ? "#60a5fa" : "#007AFF" }]}>My Quizs</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00adf2" />
          <Text style={{ color: isDark ? "#aaa" : "#555", marginTop: 12 }}>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.tableHeader, { backgroundColor: isDark ? "#1f2937" : "#00adf2" }]}>
            <Text style={styles.th}>ID</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>DATE</Text>
            <Text style={styles.th}>STATUS</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>IMAGE</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {records.length === 0 ? (
              <Text style={[styles.noData, { color: isDark ? "#888" : "#666" }]}>
                No quiz records found
              </Text>
            ) : (
              records.map((item, i) => {
                const imgUrl = getImageUrl(item);

                return (
                  <TouchableOpacity key={i} onPress={() => openModal(item)} activeOpacity={0.8}>
                    <View style={[styles.card, { backgroundColor: isDark ? "#1a1a1a" : "#fff" }]}>
                      <View style={styles.row}>
                        <Text style={[styles.idText, { color: isDark ? "#e5e" : "#222" }]}>{item.unique}</Text>
                        <Text style={[styles.dateText, { color: isDark ? "#bbb" : "#555" }]}>{item.capturedate}</Text>
                        <Text style={[styles.statusText, { color: "#00adf2" }]}>{item.status || "Pending"}</Text>

                        {imgUrl ? (
                          <Image source={{ uri: imgUrl }} style={styles.thumb} resizeMode="cover" />
                        ) : (
                          <View style={styles.noImageBox}>
                            <FontAwesome6 name="image" size={22} color="#666" />
                            <Text style={{ fontSize: 9, color: "#666" }}>No Image</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{ height: 120 }} />
          </ScrollView>
        </>
      )}

      {/* FAB */}
      <View style={styles.fabContainer}>
        {[
          { icon: "house", color: "#10b981", screen: "LandingScreen" },
          { icon: "clipboard-list", color: "#8b5cf6", screen: "Myquizs" },
        ].map((btn, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              transform: [
                {
                  translateY: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -80 - i * 70],
                  }),
                },
              ],
              opacity: fabAnim,
            }}
          >
            <TouchableOpacity
              style={[styles.fabSmall, { backgroundColor: btn.color }]}
              onPress={() => navigation.navigate(btn.screen)}
            >
              <FontAwesome6 name={btn.icon} size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity style={styles.fabMain} onPress={toggleFab}>
          <FontAwesome6 name={isFabOpen ? "xmark" : "plus"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODAL - FULLY SCROLLABLE QUIZ DETAILS */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? "#111" : "#fff" }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Quiz Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="xmark" size={28} color={isDark ? "#ccc" : "#666"} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {selectedRecord && (
                <>
                  {/* Full Image */}
                  {getImageUrl(selectedRecord) ? (
                    <View style={styles.fullImageContainer}>
                      <Image
                        source={{ uri: getImageUrl(selectedRecord) }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <View style={styles.noImageFull}>
                      <FontAwesome6 name="image-slash" size={60} color="#888" />
                      <Text style={{ color: "#888", marginTop: 16, fontSize: 18 }}>No Image Available</Text>
                    </View>
                  )}

                  {/* Info Section */}
                  <View style={styles.infoSection}>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Quiz UID:</Text>
                      <Text style={[styles.value, { color: isDark ? "#93c5fd" : "#007AFF" }]}>{selectedRecord.unique}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Date:</Text>
                      <Text style={styles.value}>{selectedRecord.capturedate}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Status:</Text>
                      <Text style={[styles.value, { color: "#10b981" }]}>{selectedRecord.status || "Pending"}</Text>
                    </View>
                    
                  </View>

                  {/* Long Response / Result */}
                  {selectedRecord.response && (
                    <View style={styles.responseBox}>
                      <Text style={{ color: isDark ? "#9ca3af" : "#444", fontWeight: "bold", marginBottom: 10 }}>
                        Result:
                      </Text>
                      <View style={[styles.responseTextBox, { backgroundColor: isDark ? "#1f2937" : "#f8fafc" }]}>
                        <Text style={{ 
                          color: isDark ? "#e5e7eb" : "#1f2937", 
                          fontSize: 15, 
                          lineHeight: 23,
                          padding: 14,
                        }}>
                          {selectedRecord.response}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Extra bottom space */}
                  <View style={{ height: 20 }} />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// COMPLETE STYLES
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center",  paddingHorizontal: 15,  },
  backBtn: { padding: 8 },
  logoBox: {  alignItems: "center" },
  logo: { width: 70, height: 50 },
  logoText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
  title: { fontSize: 21, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableHeader: { flexDirection: "row", padding: 14, marginHorizontal: 12, marginTop: 10, borderRadius: 12 },
  th: { color: "#fff", fontWeight: "bold", textAlign: "center", flex: 1, fontSize: 13 },
  card: { marginHorizontal: 12, marginVertical: 6, borderRadius: 16, padding: 16, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  idText: { flex: 1, fontSize: 14, fontWeight: "600", textAlign: "center" },
  dateText: { flex: 1.5, fontSize: 12, textAlign: "center" },
  statusText: { flex: 1, fontSize: 13, fontWeight: "bold", textAlign: "center" },
  thumb: { width: 60, height: 60, borderRadius: 12 },
  noImageBox: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#2a2a2a", justifyContent: "center", alignItems: "center" },
  noData: { textAlign: "center", marginTop: 50, fontSize: 17 },

  // FAB
  fabContainer: { position: "absolute", bottom: 30, right: 20 },
  fabSmall: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 8 },
  fabMain: { width: 66, height: 66, borderRadius: 33, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", elevation: 10 },

  // Modal
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "92%", height: "92%", borderRadius: 20, padding: 20, flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#444" },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  fullImageContainer: { alignItems: "center", backgroundColor: "#000", borderRadius: 16, padding: 8, marginVertical: 10 },
  fullImage: { width: "100%", height: 420 },
  noImageFull: { height: 420, justifyContent: "center", alignItems: "center", backgroundColor: "#111", borderRadius: 16 },
  infoSection: { marginTop: 10, paddingHorizontal: 4 },
  info: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 16, width: 110, color: "#888" },
  value: { fontSize: 16, fontWeight: "600", flex: 1, textAlign: "right" },
  responseBox: { marginTop: 20 },
  responseTextBox: { 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: "#374151", 
    overflow: "hidden" 
  },
});