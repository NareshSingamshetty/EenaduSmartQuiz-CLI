import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import Share from "react-native-share";

const SavedImagesScreen = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // ✅ for preview modal

const loadImages = async () => {
  try {
    const saved = await AsyncStorage.getItem("savedImages");
    if (saved) {
      const parsed = JSON.parse(saved);

      // Ensure proper file:// prefix
      const fixed = parsed.map((uri) =>
        uri.startsWith("file://") ? uri : "file://" + uri
      );

      setImages(fixed);
    } else {
      setImages([]);
    }
  } catch (e) {
    console.error("Failed to load images:", e);
  }
};


  const clearImages = async () => {
    await AsyncStorage.removeItem("savedImages");
    setImages([]);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleDownload = async () => {
    if (!selectedImage) return;

    try {
      const filename = `scan_${Date.now()}.png`;
      const destPath =
        Platform.OS === "android"
          ? `${RNFS.PicturesDirectoryPath}/${filename}`
          : `${RNFS.LibraryDirectoryPath}/${filename}`;

      await RNFS.copyFile(selectedImage, destPath);

      if (Platform.OS === "android") {
        ToastAndroid.show("Saved to gallery", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Saved to Photos!");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  };

const handleShare = async () => {
  if (!selectedImage) return;
  try {
    // Create a temp filename
    const filename = `share_${Date.now()}.png`;
    const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

    // Copy the image to cache
    await RNFS.copyFile(
      selectedImage.replace("file://", ""), // remove file:// if exists
      destPath
    );

    let filePath = destPath;
    if (!filePath.startsWith("file://")) {
      filePath = "file://" + filePath;
    }

    // Open share dialog
    await Share.open({
      title: "Share Image",
      url: filePath,
      type: "image/png", // you can remove this if images might be jpg
      failOnCancel: false,
    });
  } catch (error) {
    console.error("Share error:", error);
    if (Platform.OS === "android") {
      ToastAndroid.show("Unable to share image", ToastAndroid.SHORT);
    } else {
      Alert.alert("Error", "Unable to share image");
    }
  }
};


  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedImage(item)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      </View>
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.container}>
      {images.length > 0 ? (
        <>
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          <TouchableOpacity style={styles.clearBtn} onPress={clearImages}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noImagesText}>No saved images</Text>
      )}

      
      {/* ✅ Full-Screen Preview Modal */}

      <Modal visible={!!selectedImage} transparent={true}>
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeArea}
            onPress={() => setSelectedImage(null)}
          />
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          {/* ✅ Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "red" }]}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.actionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SavedImagesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  list: { padding: 12 },
  imageWrapper: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: { width: "100%", height: 250 },
  noImagesText: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  clearBtn: {
    backgroundColor: "#F05E41",
    padding: 14,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  clearText: { color: "white", fontWeight: "600", fontSize: 16 },

  // ✅ Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 12,
  },
  actionBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  actionText: { color: "white", fontWeight: "600", fontSize: 16 },
});
