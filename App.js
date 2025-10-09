import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import CameraScreen from './appsrc/screens/CameraScreen';
import HomeScreen from './appsrc/screens/HomeScreen'; 
import VisionCamera from './appsrc/screens/VisionCamera'; 
import TestScreen from './appsrc/screens/TestScreen'; 
import SavedImagesScreen from './appsrc/screens/SavedImagesScreen'; 
import TestCamera from './appsrc/screens/TestCamera'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* Global Status Bar */}
        <StatusBar 
          barStyle="light-content"   // "light-content" = white text, "dark-content" = black text
          backgroundColor="#000000"  // Status bar background (Android only)
          translucent={false}
        />

        {/* SafeArea wrapper for screens */}
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="VisionCamera" component={VisionCamera} />
            <Stack.Screen name="TestScreen" component={TestScreen} />
             <Stack.Screen name="TestCamera" component={TestCamera} />
            <Stack.Screen name="SavedImagesScreen" component={SavedImagesScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // match with status bar (black UI for camera look)
  },
});
