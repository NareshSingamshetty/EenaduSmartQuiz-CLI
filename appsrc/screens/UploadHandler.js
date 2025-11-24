// UploadHandler.js
import { Alert } from "react-native";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";

//const API_URL = "http://172.17.15.132/Eenaduapi/api/imagecrack/";

const API_URL = "https://api.eenadu.net/EenaduQuizApi/api/imagecrack";

export async function uploadCroppedImage(croppedPhotoUri, onSuccess) {
  if (!croppedPhotoUri) {
    Alert.alert("Validation Error", "Please capture and crop an image first!");
    return;
  }

  try {
    console.log("📸 Starting Base64 conversion...");
    const DeviceuniqueId = await DeviceInfo.getUniqueId();
    const now = new Date();
    const dateTime = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    const uniqueId = `AZ${Math.floor(10000 + Math.random() * 90000)}`;

    const imagePath = croppedPhotoUri.replace("file://", "");
    const base64String = await RNFS.readFile(imagePath, "base64");

    // Simulate small delay (optional)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const payloadImage = `data:image/jpg;base64,${base64String}`;

    const jsonPayload = {
      params: {
        device_id: DeviceuniqueId,
        unique_id: uniqueId,
        capturedate: dateTime,
        image: payloadImage,
      },
    };

    console.log("📤 Sending RAW JSON to Backend:", JSON.stringify(jsonPayload));
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonPayload),
    });

    const rawResponse = await response.text();
    console.log("🧾 Raw Response:", rawResponse);

    const parsed = JSON.parse(rawResponse);
    if (parsed.status === "1" || parsed.status === 1) {
      if (onSuccess) onSuccess(parsed.message);
    } else {
      Alert.alert("❌ Error", parsed.message || "Failed to insert data");
    }
  } catch (error) {
    console.error("Network Error:", error);
    Alert.alert("Network Error", error.message);
  }
}
