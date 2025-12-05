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
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import RNFS from "react-native-fs";
import ImagePicker from "react-native-image-crop-picker";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { uploadCroppedImage } from "./UploadHandler";
import ImageResizer from "react-native-image-resizer";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PREVIEW_WIDTH = 200;
const PREVIEW_HEIGHT = 500;

export default function VisionCamera() {
  const camera = useRef(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const navigation = useNavigation();
  const isScreenFocused = useIsFocused();

  const [croppedPhotoUri, setCroppedPhotoUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [userName, setUserName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!userName.trim()) {
      errors.name = "Name is required";
    } else if (userName.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    if (!mobileNumber.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (mobileNumber.length !== 10) {
      errors.mobile = "Enter valid 10-digit mobile number";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

      const cropped = await cropToExactPreviewArea(uri, photo.width, photo.height);
      setCroppedPhotoUri(cropped);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Error", "Failed to capture photo");
    } finally {
      setIsProcessing(false);
    }
  };

  const cropToExactPreviewArea = async (uri, w, h) => {
    try {
      const cropped = await ImagePicker.openCropper({
        path: uri,
        width: PREVIEW_WIDTH * 4,
        height: PREVIEW_HEIGHT * 4,
        cropperCircleOverlay: false,
        showCropFrame: false,
        showCropGuidelines: false,
        hideBottomControls: true,
        compressImageQuality: 0.9,
      });
      return cropped.path;
    } catch {
      return uri;
    }
  };

  const compressImageUnder1MB = async (uri) => {
    try {
      let quality = 85;
      let currentUri = uri;
      while (quality >= 30) {
        const resized = await ImageResizer.createResizedImage(currentUri, 1280, 1700, "JPEG", quality, 0);
        const stats = await RNFS.stat(resized.path);
        if (stats.size <= 1024 * 1024) return resized.path;
        quality -= 10;
        currentUri = resized.path;
      }
      return currentUri;
    } catch {
      return uri;
    }
  };

  const resetCapture = () => {
    setModalVisible(false);
    setCroppedPhotoUri(null);
    setUserName("");
    setMobileNumber("");
    setEmail("");
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setModalVisible(false);

    try {
      const compressedUri = await compressImageUnder1MB(croppedPhotoUri);

      await uploadCroppedImage(
        compressedUri,
        (msg) => {
          setSuccessMessage(msg);
          setSuccessModal(true);
        },
        {
          name: userName.trim(),
          mobile: mobileNumber.trim(),
          email: email.trim(),
        }
      );
    } catch (err) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome6 name="arrow-left" size={24} color="#00adf2" />
      </TouchableOpacity>

      <View style={[styles.cameraContainer, { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }]}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          device={device}
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

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={false}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.formModalContainer}>
              <Text style={styles.formTitle}>Complete Your Submission</Text>

              {croppedPhotoUri && (
                <Image source={{ uri: croppedPhotoUri }} style={styles.formPreviewImage} resizeMode="contain" />
              )}

              <View style={styles.formContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="words"
                />
                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={[styles.input, formErrors.mobile && styles.inputError]}
                  placeholder="9876543210"
                  placeholderTextColor="#999"
                  value={mobileNumber}
                  onChangeText={(t) => setMobileNumber(t.replace(/\D/g, "").slice(0, 10))}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {formErrors.mobile && <Text style={styles.errorText}>{formErrors.mobile}</Text>}

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, formErrors.email && styles.inputError]}
                  placeholder="you@example.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.retakeBtn} onPress={resetCapture}>
                  <Text style={styles.btnText}>Retake</Text>
                </TouchableOpacity>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* YOUR ORIGINAL SUCCESS MODAL – 100% RESTORED */}
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
            <Text style={styles.modalMessage}>
              {successMessage || "Your quiz has been submitted successfully!"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
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

// YOUR ORIGINAL STYLES – FULLY RESTORED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  cameraContainer: {
    borderWidth: 0.5,
    borderColor: "#00FF41",
    borderRadius: 6,
    overflow: "hidden",
  },
  exactCaptureBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(0,255,65,0.6)",
  },
  captureButton: {
    marginTop: 30,
    backgroundColor: "#00adf2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  disabled: { backgroundColor: "#666" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  formModalContainer: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00FF41",
    textAlign: "center",
    marginBottom: 20,
  },
  formPreviewImage: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#00FF41",
    marginBottom: 25,
  },
  formContainer: { width: "100%" },
  label: { color: "#fff", fontSize: 16, marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 5,
  },
  inputError: { borderColor: "#FF3B30", borderWidth: 1 },
  errorText: { color: "#FF3B30", fontSize: 13, marginBottom: 12, marginLeft: 5 },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 10,
  },
  retakeBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    flex: 1,
    marginRight: 10,
  },
  submitBtn: {
    backgroundColor: "#34C759",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    flex: 1,
    marginLeft: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" },

  // YOUR ORIGINAL SUCCESS MODAL STYLES
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