import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Right Corner */}
      <TouchableOpacity
        style={styles.savedImagesIcon}
        onPress={() => navigation.navigate('SavedImagesScreen')}
      >
        <Text style={styles.iconText}>📂</Text>
      </TouchableOpacity>


      <View style={styles.middleContainer}>
        
         
        

        <TouchableOpacity
          style={styles.openCameraButton}
          onPress={() => navigation.navigate('TestScreen')}
        >
          <Text style={styles.buttonText}>Cam-1</Text>
        </TouchableOpacity>

         <TouchableOpacity
          style={styles.openCameraButton}
          onPress={() => navigation.navigate('TestCamera')}
        >
          <Text style={styles.buttonText}>Cam-2</Text>
        </TouchableOpacity>

         <TouchableOpacity
          style={styles.openCameraButton}
          onPress={() => navigation.navigate('VisionCamera')}
        >
          <Text style={styles.buttonText}>VisionCamera</Text>
        </TouchableOpacity>



      </View>
    </View>

  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openCameraButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 4,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedImagesIcon: {
    position: 'absolute',
    top: 20,      // adjust for safe area / notch
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#34d399', // green circle background
    elevation: 3,
  },
  iconText: {
    fontSize: 20,
  },
});

