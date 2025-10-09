import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Image,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import RNFS from "react-native-fs";
import Share from "react-native-share";

export default function VisionCamera() {
  const camera = useRef(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const [photoUri, setPhotoUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const takePhoto = async () => {
    if (!camera.current) return;

    try {
      const photo = await camera.current.takePhoto({ qualityPrioritization: "quality" });
      const uri = Platform.OS === "android" ? `file://${photo.path}` : photo.path;
      setPhotoUri(uri);
      setModalVisible(true);
    } catch (err) {
      console.error("Error capturing photo:", err);
    }
  };

  const savePhoto = async () => {
    if (!photoUri) return;

    try {
      let destPath =
        Platform.OS === "android"
          ? `${RNFS.ExternalStorageDirectoryPath}/Pictures/photo_${Date.now()}.png`
          : `${RNFS.DocumentDirectoryPath}/photo_${Date.now()}.png`;

      await RNFS.copyFile(photoUri, destPath);

      if (Platform.OS === "android") {
        await RNFS.scanFile(destPath);
        ToastAndroid.show("Photo saved to gallery!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Saved!", `Photo saved at: ${destPath}`);
      }

      console.log("Photo saved at:", destPath);
    } catch (err) {
      console.error("Error saving photo:", err);
      if (Platform.OS === "android") {
        ToastAndroid.show("Failed to save photo", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Failed to save photo");
      }
    }
  };

  // ✅ Share function
  const handleShare = async () => {
    if (!photoUri) return;
    try {
      const filename = `share_${Date.now()}.png`;
      const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.copyFile(photoUri, destPath);

      let filePath = destPath;
      if (Platform.OS === "android" && !filePath.startsWith("file://")) {
        filePath = "file://" + filePath;
      }

      await Share.open({
        title: "Share Captured Image",
        url: filePath,
        type: "image/png",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <View style={styles.cameraContainer}>
        {device && (
          <Camera
            style={styles.cameraPreview}
            device={device}
            isActive
            ref={camera}
            photo
          />
        )}
      </View>

      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <Text style={styles.buttonText}>📸</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={false} animationType="slide">
        <View style={styles.modalContainer}>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.previewImage} />}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>

           

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#0ba42fff" }]}
              onPress={savePhoto}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#007AFF" }]}
              onPress={handleShare}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: "green",
    overflow: "hidden",
    borderRadius: 10,
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
  },
  captureButton: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 40,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  actionButton: {
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  previewImage: { width: "90%", height: "70%", resizeMode: "contain", borderRadius: 10 },
});
