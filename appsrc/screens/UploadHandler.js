// UploadHandler.js
import { Alert } from "react-native";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";

const API_URL = "https://api.eenadu.net/EenaduQuizApi/api/imagecrack";

export async function uploadCroppedImage(croppedPhotoUri, onSuccess, userDetails) {
  if (!croppedPhotoUri) {
    Alert.alert("Error", "No image captured");
    return;
  }

  if (!userDetails?.name || !userDetails?.mobile || !userDetails?.email) {
    Alert.alert("Error", "Please fill Name, Mobile & Email");
    return;
  }

  try {
    console.log("Starting upload...");

    const deviceId = await DeviceInfo.getUniqueId();
    const now = new Date();
    const capturedate = `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    const unique_id = `AZ${Math.floor(100000 + Math.random() * 900000)}`;

    // Read and encode image
    const imagePath = croppedPhotoUri.replace("file://", "");
    const base64 = await RNFS.readFile(imagePath, "base64");
    const image = `data:image/jpg;base64,${base64}`;

    // EXACT PAYLOAD YOUR BACKEND EXPECTS
    const payload = {
      params: {
        device_id: deviceId,
        unique_id: unique_id,
        capturedate: capturedate,
        image: image,
        name: userDetails.name.trim(),
        mobile: userDetails.mobile.trim(),
        Email: userDetails.email.trim(), // CAPITAL "E" REQUIRED!
      },
    };

    console.log("Sending to API:", JSON.stringify(payload, null, 2));

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const textResponse = await response.text();
    console.log("Raw Response:", textResponse);

    let json;
    try {
      json = JSON.parse(textResponse);
    } catch (e) {
      Alert.alert("Server Error", "Invalid response from server");
      return;
    }

    if (json.status === "1" || json.status === 1 || json.status === "success") {
      onSuccess?.(json.message || "Submitted successfully!");
    } else {
      Alert.alert("Failed", json.message || "Missing required fields");
    }
  } catch (error) {
    console.error("Upload Error:", error);
    Alert.alert("Upload Failed", error.message || "Check internet connection");
  }
}