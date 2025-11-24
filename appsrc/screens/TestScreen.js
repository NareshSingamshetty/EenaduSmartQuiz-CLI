import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";

import ImagePicker from "react-native-image-crop-picker";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TestScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const openCamera = async () => {
    try {
      setLoading(true);
      setImageUri(null);

      const image = await ImagePicker.openCamera({
        cropping: false, // 👈 no cropping
        compressImageQuality: 1,
        includeBase64: false,
      });

      if (image?.path) {
        // 👇 COMMENTED cropping code
        // const cropped = await ImagePicker.openCropper({
        //   path: image.path,
        //   width: 800,
        //   height: 1000,
        //   freeStyleCropEnabled: true,
        //   cropperToolbarTitle: "Adjust Crop",
        //   compressImageQuality: 1,
        //   compressImageFormat: "png",
        // });
        
        // if (cropped?.path) setImageUri(cropped.path);

        // ✅ Directly use captured image path
        setImageUri(image.path);
      }
    } catch (e) {
      console.log("Camera failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Save captured image to gallery + AsyncStorage list
  const handleDownload = async () => {
    if (!imageUri) return;

    try {
      const filename = `scan_${Date.now()}.png`;
      const destPath =
        Platform.OS === "android"
          ? `${RNFS.PicturesDirectoryPath}/${filename}`
          : `${RNFS.LibraryDirectoryPath}/${filename}`;

      await RNFS.copyFile(imageUri, destPath);

      if (Platform.OS === "android") {
        ToastAndroid.show("Saved to gallery", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Saved to Photos!");
      }

      const existing = await AsyncStorage.getItem("savedImages");
      let images = existing ? JSON.parse(existing) : [];
      images.push(destPath);
      await AsyncStorage.setItem("savedImages", JSON.stringify(images));

      console.log("Saved images list:", images);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Share captured PNG
  const handleShare = async () => {
    if (!imageUri) return;
    try {
      const filename = `share_${Date.now()}.png`;
      const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.copyFile(imageUri, destPath);

      let filePath = destPath;
      if (Platform.OS === "android" && !filePath.startsWith("file://")) {
        filePath = "file://" + filePath;
      }

      await Share.open({
        title: "Share Captured PNG",
        url: filePath,
        type: "image/png",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  useEffect(() => {
    openCamera();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.waitingText}>Processing...</Text>
      ) : imageUri ? (
        <View style={styles.preview}>
          <Text style={styles.label}>Captured PNG Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.retake]} onPress={openCamera}>
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.shareBtn]} onPress={handleShare}>
              <Text style={styles.btnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.useBtn]} onPress={handleDownload}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.waitingText}>Opening Camera...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
      justifyContent: "center",
       backgroundColor: "#000" 
      },
  waitingText: {
     color: "white",
     textAlign: "center",
      fontSize: 16 
    },
  preview: {
     flex: 1,
      justifyContent: "center", 
      alignItems: "center"
     },
  label: {
     color: "white",
      marginBottom: 10
     },
  image: { 
    width: "90%",
     height: "70%",
      borderRadius: 8
     },
  actions: {
     flexDirection: "row", 
     marginTop: 16
     },
  btn: {
     padding: 12,
      borderRadius: 8,
       marginHorizontal: 8 
      },
  retake: { 
    backgroundColor: "gray"
   },
  shareBtn: {
     backgroundColor: "#2563eb"
     },
  useBtn: {
     backgroundColor: "#2563eb"
     },
  btnText: { 
    color: "white", 
    fontWeight: "600" },
});
