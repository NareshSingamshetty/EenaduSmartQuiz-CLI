import React from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import your screens
import CameraScreen from './appsrc/screens/CameraScreen';
import VisionCamera from './appsrc/screens/VisionCamera';
import Dashboard from './appsrc/screens/Dashboard';
import LandingScreen from './appsrc/screens/LandingScreen';
import Leaderboard from './appsrc/screens/Leaderboard';
import Myquizs from './appsrc/screens/Myquizs';
import Winners from './appsrc/screens/Winners';
import SplashScreen from './appsrc/screens/SplashScreen';

const Stack = createNativeStackNavigator();

// ✅ Custom app themes (extending React Navigation themes)
const LightAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    text: '#000000',
    primary: '#0078ff',
    card: '#f8f8f8',
    border: '#dcdcdc',
  },
};

const DarkAppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    text: '#ffffff',
    primary: '#00adf2',
    card: '#111111',
    border: '#222222',
  },
};

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = isDark ? DarkAppTheme : LightAppTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />

        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
          edges={['top', 'left', 'right']}
        >
          <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="Winners" component={Winners} />
                <Stack.Screen name="Myquizs" component={Myquizs} />
                <Stack.Screen name="Leaderboard" component={Leaderboard} />
                <Stack.Screen name="LandingScreen" component={LandingScreen} />
                <Stack.Screen name="CameraScreen" component={CameraScreen} />
                <Stack.Screen name="VisionCamera" component={VisionCamera} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
              </Stack.Navigator>
            </View>

            {/* Footer */}
            <View
              style={[styles.footer, { backgroundColor: theme.colors.card }]}
            >
              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.text },
                ]}
              >
                Powered by:
                <Text
                  style={[
                    styles.footerBrand,
                    { color: theme.colors.primary },
                  ]}
                >
                  
                Margadarsi Computers
                </Text>
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { flex: 1 },
  footer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 10,
    fontFamily: 'sans-serif',
  },
  footerBrand: {
    fontWeight: 'bold',
    fontSize: 11,
  },
});
