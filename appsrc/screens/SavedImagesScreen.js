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
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";

const { width } = Dimensions.get("window");

const SavedImagesScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Load images from AsyncStorage
  const loadImages = async () => {
    try {
      const saved = await AsyncStorage.getItem("photoKeys");
      if (saved) {
        const keys = JSON.parse(saved);
        const allImages = [];

        // Load base64 images
        for (let key of keys) {
          const base64Data = await AsyncStorage.getItem(key);
          if (base64Data) {
            allImages.push(`data:image/png;base64,${base64Data}`);
          }
        }

        setImages(allImages);
      } else {
        setImages([]);
      }
    } catch (e) {
      console.error("Failed to load images:", e);
    }
  };

  // ✅ Clear all saved images
  const clearImages = async () => {
    try {
      const saved = await AsyncStorage.getItem("photoKeys");
      if (saved) {
        const keys = JSON.parse(saved);
        for (let key of keys) {
          await AsyncStorage.removeItem(key);
        }
        await AsyncStorage.removeItem("photoKeys");
      }

      setImages([]);

      if (Platform.OS === "android") {
        ToastAndroid.show("All images cleared", ToastAndroid.SHORT);
      } else {
        Alert.alert("Cleared", "All saved images removed");
      }
    } catch (e) {
      console.error("Error clearing images:", e);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // ✅ Download image to gallery
  const handleDownload = async () => {
    if (!selectedImage) return;

    try {
      const base64Data = selectedImage.replace(/^data:image\/png;base64,/, "");
      const filename = `scan_${Date.now()}.png`;
      const destPath =
        Platform.OS === "android"
          ? `${RNFS.PicturesDirectoryPath}/${filename}`
          : `${RNFS.LibraryDirectoryPath}/${filename}`;

      await RNFS.writeFile(destPath, base64Data, "base64");

      if (Platform.OS === "android") {
        ToastAndroid.show("Saved to gallery", ToastAndroid.SHORT);
      } else {
        Alert.alert("Saved", "Image saved successfully");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  };

  // ✅ Render image item
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedImage(item)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Header with Back & Title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation ? navigation.goBack() : Alert.alert("Back pressed"))}
        >
          <Text style={styles.backText}>❮ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Images</Text>
        <View style={{ width: 60 }} /> 
      </View>

      {images.length > 0 ? (
        <>
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
          />

          <TouchableOpacity style={styles.clearBtn} onPress={clearImages}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noImagesText}>No saved images</Text>
      )}

      {/* ✅ Full Screen Preview Modal */}
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

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <Text style={styles.actionText}>Download</Text>
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

  // ✅ Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    // backgroundColor: "#2563eb",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },

  list: { padding: 8 },
  row: { justifyContent: "space-between" },
  imageWrapper: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    width: width / 2 - 16,
    height: 200,
  },
  image: { width: "100%", height: "100%" },
  noImagesText: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
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
    backgroundColor: "rgba(0,0,0,0.95)",
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
