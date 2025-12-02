import React, { useState, useEffect, useCallback, useMemo } from "react";
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


// This proxy script must now be configured with the AWS SDK to access S3.
const IMAGE_PROXY_URL = "http://10.0.3.153/Crons/uploadview.php";

const EENADU_LOGO = require("../assets/images/eenadu.png");

export default function MyQuizScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const fabAnim = useMemo(() => new Animated.Value(0), []);

  // ✅ SIMPLIFIED getImageUrl: Returns a string URI for the Image component.
  // The User-Agent is not included here as the PHP script handles S3 auth.
  const getImageUrl = useCallback((record) => {
    const url = record.image || "";
    if (!url || url.trim() === "") return null;
    
    // Returns a simple string URI to the PHP proxy with URL encoding
    return `${IMAGE_PROXY_URL}?imgurl=${encodeURIComponent(url)}`;
  }, []);

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

        console.log(`\nFOUND ${json.message.length} QUIZ RECORDS\n`);
        json.message.forEach((item, i) => {
          const imgUrl = getImageUrl(item);
          console.log(`--- Quiz ${i + 1} ---`);
          console.log("ID       :", item.unique);
          console.log("Date     :", item.capturedate);
          console.log("Status   :", item.status || "Pending");
          console.log("S3 URL   :", item.image || "No image");
          console.log("PROXY URL:", imgUrl || "No image");
          
        });
      } else {
        setRecords([]);
        console.log("No records or API error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Cannot load quizzes");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [getImageUrl]);

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

  const cardBackgroundColor = isDark ? "#1a1a1a" : "#fff";
  const textColor = isDark ? "#e5e5e5" : "#222";
  const secondaryTextColor = isDark ? "#bbb" : "#555";
  const accentColor = isDark ? "#60a5fa" : "#007AFF";
  const headerBackground = isDark ? "#0a0a0a" : "#f8f9fa";
  const tableHeaderBackground = isDark ? "#1f2937" : "#00adf2";
  const fabMainColor = "#3b82f6";
  const statusColor = "#00adf2"; 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: headerBackground }]}>
      {/* HEADER */}
   <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop:20, padding:5}}>
          <FontAwesome6 name="chevron-left" size={24} color={isDark ? "#60a5fa" : "#007AFF"} />
        </TouchableOpacity>

        <View style={styles.logoBox}>
          <Image source={EENADU_LOGO} style={{height:50, width:50}} resizeMode="contain" />
          <Text style={[styles.logoText, { color: isDark ? "#e5e7eb" : "#111" }]}>Smart Quiz</Text>
        </View>
        
       <View style = {{ flex: 1, alignItems: "center", marginTop:20 }}>
        <Text style={[styles.title, { color: isDark ? "#60a5fa" : "#007AFF" }]}>My Quizs</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={statusColor} />
          <Text style={{ color: isDark ? "#aaa" : "#555", marginTop: 12 }}>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.tableHeader, { backgroundColor: tableHeaderBackground }]}>
            <Text style={styles.th}>ID</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>DATE</Text>
            <Text style={styles.th}>STATUS</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>IMAGE</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {records.length === 0 ? (
              <Text style={[styles.noData, { color: secondaryTextColor }]}>
                No quiz records found
              </Text>
            ) : (
              records.map((item, i) => {
                const imgUrl = getImageUrl(item);
                const status = item.status || "Pending";

                return (
                  <TouchableOpacity key={i} onPress={() => openModal(item)} activeOpacity={0.8}>
                    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
                      <View style={styles.row}>
                        <Text style={[styles.idText, { color: textColor }]}>{item.unique}</Text>
                        <Text style={[styles.dateText, { color: secondaryTextColor }]}>{item.capturedate}</Text>
                        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>

                        {imgUrl ? (
                         
                          <Image
                            source={{ uri: item.image }} 
                            style={styles.thumb}
                            resizeMode="cover"
                            onError={(e) => console.log("Image load failed:", e.nativeEvent.error)}
                          />
                        ) : (
                          <View style={[styles.noImageBox, { backgroundColor: isDark ? "#333" : "#eee" }]}>
                            <FontAwesome6 name="image" size={22} color={secondaryTextColor} />
                            <Text style={{ fontSize: 9, color: secondaryTextColor }}>No Image</Text>
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
              onPress={() => {
                setIsFabOpen(false);
                navigation.navigate(btn.screen);
              }}
            >
              <FontAwesome6 name={btn.icon} size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity style={[styles.fabMain, { backgroundColor: fabMainColor }]} onPress={toggleFab}>
          <FontAwesome6 name={isFabOpen ? "xmark" : "plus"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? "#111" : "#fff" }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? "#444" : "#ddd" }]}>
              <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Quiz Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="xmark" size={28} color={isDark ? "#ccc" : "#666"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 30 }}>
              {selectedRecord && (
                <>
                  {(selectedRecord) ? (
                    <View style={styles.fullImageContainer}>
                      <Image
                        source={{ uri: (selectedRecord.image) }}
                        style={[styles.fullImage, { backgroundColor: isDark ? "#000" : "#fff" }]}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <View style={[styles.noImageFull, { backgroundColor: isDark ? "#111" : "#f0f0f0" }]}>
                      <FontAwesome6 name="image-slash" size={60} color="#888" />
                      <Text style={{ color: "#888", marginTop: 16, fontSize: 18 }}>No Image Available</Text>
                    </View>
                  )}

                  <View style={styles.infoSection}>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Quiz UID:</Text>
                      <Text style={[styles.value, { color: isDark ? "#93c5fd" : "#007AFF" }]}>{selectedRecord.unique}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Date:</Text>
                      <Text style={[styles.value, { color: isDark ? "#fff" : "#000" }]}>{selectedRecord.capturedate}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.label, { color: isDark ? "#ccc" : "#444" }]}>Status:</Text>
                      <Text style={[styles.value, { color: "#10b981" }]}>{selectedRecord.status || "Pending"}</Text>
                    </View>
                  </View>

                  {selectedRecord.response && (
                    <View style={styles.responseBox}>
                      <Text style={{ color: isDark ? "#9ca3af" : "#444", fontWeight: "bold", marginBottom: 10 }}>
                        Result:
                      </Text>
                      <View style={[styles.responseTextBox, { backgroundColor: isDark ? "#1f2937" : "#f8fafc", borderColor: isDark ? "#374151" : "#ddd" }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row",  },
  backBtn: { MarginTop:30 },
  logoBox: {  alignItems: "center", },
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
  thumb: { width: 60, height: 60, borderRadius: 12, borderWidth: 1, borderColor: "#ccc" },
  noImageBox: { width: 60, height: 60, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#ccc" }, 
  noData: { textAlign: "center", marginTop: 50, fontSize: 17 },
  fabContainer: { position: "absolute", bottom: 30, right: 20 },
  fabSmall: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 8 },
  fabMain: { width: 66, height: 66, borderRadius: 33, justifyContent: "center", alignItems: "center", elevation: 10 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "92%", height: "92%", borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  fullImageContainer: { alignItems: "center", borderRadius: 16, padding: 8, marginVertical: 10 },
  fullImage: { width: "100%", height: 420, borderRadius:10 },
  noImageFull: { height: 420, justifyContent: "center", alignItems: "center", borderRadius: 16 }, 
  infoSection: { marginTop: 10, paddingHorizontal: 4 },
  info: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 16, width: 110, color: "#888" },
  value: { fontSize: 16, fontWeight: "600", flex: 1, textAlign: "right" },
  responseBox: { marginTop: 20 },
  responseTextBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  logo: { width: 200, height: 60, alignSelf: "center", marginTop: 20 },
});