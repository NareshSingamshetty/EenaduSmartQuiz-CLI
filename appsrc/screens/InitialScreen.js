import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const { width, height } = Dimensions.get('window');

const InitialScreen = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('VisionCamera');
  };

  const handleDashboard = () => {
    navigation.navigate('Dashboard');
  };
   const handleLanding = () => {
    navigation.navigate('LandingScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dashboard Icon - Top Right */}
      <TouchableOpacity style={styles.dashboardButton} onPress={handleDashboard}>
        <FontAwesome6 name="gauge-high" size={width * 0.06} color="#fff" solid />
      </TouchableOpacity>

      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/eenadu.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Middle Content - Reduced Gap */}
      <View style={styles.middleContainer}>
        <Image
          source={require('../assets/images/quiz3.jpg')}
          style={styles.quizImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
          <FontAwesome6 name="arrow-right" size={width * 0.06} color="#fff" solid />
        </TouchableOpacity>

         <TouchableOpacity style={styles.button} onPress={handleLanding}>
          <Text style={styles.buttonText}>LandingScreen</Text>
          <FontAwesome6 name="arrow-right" size={width * 0.06} color="#fff" solid />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InitialScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.05,
    alignItems: 'center',
  },

  dashboardButton: {
    position: 'absolute',
    top: height * 0.05,
    right: width * 0.05,
    backgroundColor: '#00adf2',
    padding: width * 0.03,
    borderRadius: 30,
    elevation: 3,
    zIndex: 10,
  },

  logoContainer: {
    alignItems: 'center',
   // marginTop: height * 0.03,
   // marginBottom: height * 0.015,
  },

  logo: {
    width: width * 0.4,
    height: height * 0.2,
  },

  middleContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  quizImage: {
    marginTop:50,
    width: width * 1.1,
    height: height * 0.4,
   // marginBottom: height * 0.015, // ✅ reduced gap between quiz image & button
  },

  button: {
    backgroundColor: '#00adf2',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.25,
    borderRadius: 25,
   // marginTop:80,
    flexDirection:'row',
  
  },

  buttonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
    letterSpacing: 1,
    right:10
  },
});
