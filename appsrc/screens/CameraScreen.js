import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function saveToGallery(uri) {
  try {
    const filename = `scan_${Date.now()}.png`;
    const destPath =
      Platform.OS === "android"
        ? `${RNFS.PicturesDirectoryPath}/${filename}`
        : `${RNFS.LibraryDirectoryPath}/${filename}`;

    await RNFS.copyFile(uri, destPath);

    if (Platform.OS === "android") {
      ToastAndroid.show("Saved to gallery", ToastAndroid.SHORT);
    } else {
      Alert.alert("Success", "Saved to Photos!");
    }

    return destPath;
  } catch (error) {
    console.error("Save error:", error);
  }
}

export default function CameraScreen() {
  const [uri, setUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanOnce = useCallback(async () => {
    try {
      setLoading(true);
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 1,
        letUserAdjustCrop: false,
        imageQuality: 1.0,
      });

      const first = result?.scannedImages?.[0];
      if (first) setUri(first);
      else setUri(null);
    } catch (e) {
      console.warn("Scan cancelled:", e);
      setUri(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scanOnce();
  }, [scanOnce]);

  const handleShare = async () => {
    if (!uri) return;
    try {
      await Share.open({
        title: "Share Scanned Document",
        url: Platform.OS === "android" ? `file://${uri}` : uri,
        type: "image/png",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleDownload = async () => {
    if (!uri) return;
    const savedPath = await saveToGallery(uri);

    // ✅ Save to AsyncStorage list
    const existing = await AsyncStorage.getItem("savedImages");
    let images = existing ? JSON.parse(existing) : [];
    images.push(savedPath);
    await AsyncStorage.setItem("savedImages", JSON.stringify(images));

    setUri(null);
    scanOnce();
  };

  return (
    <View style={styles.body}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Opening Camera…</Text>
        </View>
      )}
      {!loading && uri && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.outline]} onPress={scanOnce}>
            <Text style={styles.outlineText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={handleShare}>
            <Text style={styles.primaryText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={handleDownload}>
            <Text style={styles.primaryText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: "black", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  hint: { color: "#cbd5e1" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    gap: 12,
    backgroundColor: "black",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  outline: { borderWidth: 1, borderColor: "#475569" },
  outlineText: { color: "#e2e8f0", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#2563eb" },
  primaryText: { color: "white", fontWeight: "700" },
});
