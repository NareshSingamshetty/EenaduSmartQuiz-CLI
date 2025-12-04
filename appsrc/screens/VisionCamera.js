import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Platform,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import RNFS, { stat } from "react-native-fs";
import ImagePicker from "react-native-image-crop-picker";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
// 🚨 Import useIsFocused for camera management
import { useNavigation, useIsFocused } from "@react-navigation/native"; 
import { uploadCroppedImage } from "./UploadHandler";
import ImageResizer from "react-native-image-resizer";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PREVIEW_WIDTH = 200;
const PREVIEW_HEIGHT = 500;
const PREVIEW_ASPECT_RATIO = PREVIEW_WIDTH / PREVIEW_HEIGHT;

export default function VisionCamera() {
  const camera = useRef(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const navigation = useNavigation();
  // 🚨 Determine if the screen is focused
  const isScreenFocused = useIsFocused(); 

  const [croppedPhotoUri, setCroppedPhotoUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const takePhoto = async () => {
    if (!camera.current || !device) return;
    try {
      setIsProcessing(true);
      const photo = await camera.current.takePhoto({
        qualityPrioritization: "quality",
        format: "jpeg",
      });

      const uri = Platform.select({
        ios: photo.path,
        android: `file://${photo.path}`,
      });

      const croppedUri = await cropToExactPreviewArea(
        uri,
        photo.width,
        photo.height
      );
      setCroppedPhotoUri(croppedUri);
      setModalVisible(true);
    } catch (err) {
      console.error("Capture error:", err);
      Alert.alert("Error", "Failed to capture photo");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePreviewCropRect = (photoWidth, photoHeight) => {
    const photoAspect = photoWidth / photoHeight;
    const previewAspect = PREVIEW_ASPECT_RATIO;
    let cropX, cropY, cropWidth, cropHeight;

    if (photoAspect > previewAspect) {
      cropHeight = photoHeight;
      cropWidth = photoHeight * previewAspect;
      cropX = (photoWidth - cropWidth) / 2;
      cropY = 0;
    } else {
      cropWidth = photoWidth;
      cropHeight = photoWidth / previewAspect;
      cropX = 0;
      cropY = (photoHeight - cropHeight) / 2;
    }

    return {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    };
  };

  const cropToExactPreviewArea = async (
    originalUri,
    photoWidth,
    photoHeight
  ) => {
    try {
      const cropRect = calculatePreviewCropRect(photoWidth, photoHeight);
      const croppedImage = await ImagePicker.openCropper({
        path: originalUri,
        // Using a higher resolution for cropping ensures better quality
        width: PREVIEW_WIDTH * 4, 
        height: PREVIEW_HEIGHT * 4,
        initialCropRect: cropRect,
        compressImageQuality: 0.9,
        mediaType: "photo",
        cropperCircleOverlay: false,
        showCropFrame: false,
        showCropGuidelines: false,
        hideBottomControls: true,
      });
      return croppedImage.path;
    } catch (error) {
      console.error("Crop failed:", error);
      // Return originalUri if cropping is cancelled or fails
      return originalUri; 
    }
  };

  // ✅ Compress image under 1MB (1024KB)
  const compressImageUnder1MB = async (uri) => {
    try {
      let quality = 90; // start high
      let resized = null;
      let sizeKB = Infinity;

      const MAX_WIDTH = 1280;
      const MAX_HEIGHT = 1700;

      while (quality >= 30 && sizeKB > 1024) {
        resized = await ImageResizer.createResizedImage(
          uri,
          MAX_WIDTH,
          MAX_HEIGHT,
          "JPEG",
          quality,
          0
        );

        const info = await stat(resized.path);
        sizeKB = info.size / 1024;

        console.log(
          `Compression attempt: ${quality}% → ${Math.round(sizeKB)} KB`
        );

        quality -= 5;
        uri = resized.uri;
      }

      if (resized) {
        const finalInfo = await stat(resized.path);
        console.log(
          `✅ Final image size: ${(finalInfo.size / 1024).toFixed(
            1
          )} KB (Quality ${quality + 5}%)`
        );
        return resized.uri;
      }

      return uri;
    } catch (err) {
      console.error("Compression failed:", err);
      return uri;
    }
  };

  const handleSaveToGallery = async () => {
    if (!croppedPhotoUri) {
      Alert.alert("No Image", "Please capture an image first!");
      return;
    }

    try {
      setIsProcessing(true);

      const compressedUri = await compressImageUnder1MB(croppedPhotoUri);
      const originalPath = compressedUri.replace("file://", "");
      const timestamp = new Date().getTime();
      const newFileName = `Cropped_Image_${timestamp}.jpg`;

      const destinationPath =
        Platform.OS === "android"
          ? `${RNFS.PicturesDirectoryPath}/${newFileName}`
          : `${RNFS.DocumentDirectoryPath}/${newFileName}`;

      await RNFS.copyFile(originalPath, destinationPath);
      Alert.alert("🎉 Success", `Image saved`);
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", `Failed to save image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setModalVisible(false);
    setCroppedPhotoUri(null);
  };

  const handleSubmit = async () => {
    if (!croppedPhotoUri) {
      Alert.alert("No Image", "Please capture an image first!");
      return;
    }

    try {
      setIsProcessing(true); // show loader immediately
      setModalVisible(false); // Close the preview modal immediately

      console.log("🔄 Compressing image before upload...");
      const compressedUri = await compressImageUnder1MB(croppedPhotoUri);
      console.log("✅ Compression done, preparing Base64...");

      // Wait for base64 + API call inside uploadCroppedImage
      await uploadCroppedImage(compressedUri, (msg) => {
        setSuccessMessage(msg);
        setSuccessModal(true);
      });
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Error", "Something went wrong during upload.");
    } finally {
      setIsProcessing(false); // hide loader after everything done
      setCroppedPhotoUri(null); // Clear image after successful submit/failure
    }
  };

  if (!device)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome6 name="arrow-left" size={24} color="#00adf2" />
      </TouchableOpacity>

      <View
        style={[
          styles.cameraContainer,
          { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT },
        ]}
      >
        <Camera
          style={StyleSheet.absoluteFillObject}
          device={device}
          // 💡 CRITICAL FIX: Only activate camera when screen is focused AND modal is closed
          isActive={isScreenFocused && !modalVisible} 
          ref={camera}
          photo={true}
        />
        <View style={styles.exactCaptureBorder} />
      </View>

      <TouchableOpacity
        style={[styles.captureButton, isProcessing && styles.disabled]}
        onPress={takePhoto}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? "Processing..." : "Capture"}
        </Text>
      </TouchableOpacity>

      {/* Image Preview Modal */}
      <Modal visible={modalVisible} animationType="none">
        <View style={styles.modal}>
          {croppedPhotoUri && (
            <Image
              source={{ uri: croppedPhotoUri }}
              style={styles.exactPreview}
              resizeMode="cover"
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.retakeBtn} onPress={resetCapture}>
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>

           {/*
            
             <TouchableOpacity
              style={[styles.saveBtn, isProcessing && styles.disabled]}
              onPress={handleSaveToGallery}
              disabled={isProcessing}
            >
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            
            */}

            <TouchableOpacity
              style={[styles.submitBtn, isProcessing && styles.disabled]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              <Text style={styles.btnText}>
                {isProcessing ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ Success Modal */}
      <Modal
        visible={successModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconView}>
              <FontAwesome6 name="check" size={40} color="#ffffff" />
            </View>
            {/* <Text style={styles.modalTitle}>Thank you</Text>  */}
            <Text style={styles.modalMessage}>
              {successMessage || "Your quiz has been submitted successfully!"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                // Clear state when navigating away
                setCroppedPhotoUri(null); 
                navigation.navigate("LandingScreen");
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 10 },
  cameraContainer: {
    borderWidth: 1,
    borderColor: "#00FF41",
    borderRadius: 12,
    overflow: "hidden",
  },
  exactCaptureBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(0,255,65,0.6)",
  },
  captureButton: {
    marginTop: 20,
    backgroundColor: "#00adf2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  disabled: { backgroundColor: "#666" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modal: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", height:'70%' },
  exactPreview: {
    width: PREVIEW_WIDTH * 1.3,
    height: PREVIEW_HEIGHT * 1.3,
    borderWidth: 3,
    borderColor: "#00FF41",
    borderRadius: 12,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    //marginTop: 10,
  },
  retakeBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    margin: 5,
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    margin: 5,
  },
  submitBtn: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    margin: 5,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "#fff", fontSize: 18 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: 280,
    borderRadius: 20,
    backgroundColor: "#f7fcff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 15,
    elevation: 15,
  },
  modalIconView: {
    height: 70,
    width: 70,
    borderRadius: 100,
    backgroundColor: "#66db21",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "#000" },
  modalMessage: {
    fontSize: 12,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 5,
  },
  closeButton: {
    marginTop: 15,
    height: 35,
    width: 100,
    borderRadius: 10,
    backgroundColor: "#66db21",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  closeButtonText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});