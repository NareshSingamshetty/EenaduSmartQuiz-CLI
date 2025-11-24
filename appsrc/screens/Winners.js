import { StyleSheet, Text, View, TouchableOpacity, Image, useColorScheme } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const Winners = () => {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F5F7FA' }]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        {/* Left: Back button + Logo + Smart Quiz */}
        <View style={styles.leftHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6
              name="chevron-left"
              size={20}
              color={isDark ? '#FFFFFF' : '#00adf2'}
            />
          </TouchableOpacity>

          <View style={styles.logoTextContainer}>
            <Image
              source={require('../assets/images/eenadu.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[styles.smartQuizText, { color: isDark ? '#FFFFFF' : '#111827' }]}
            >
              Smart Quiz
            </Text>
          </View>
        </View>

        {/* Center: Page Title */}
        <Text
          style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#00adf2' }]}
        >
          🏆 Winners
        </Text>

        {/* Right empty space */}
        <View style={{ width: 50 }} />
      </View>

      {/* Screen content */}
      <View style={styles.content}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: 16 }}>
          {/* Your winners content goes here */}
          Winner list will appear here
        </Text>
      </View>
    </View>
  );
};

export default Winners;

const styles = StyleSheet.create({
  container: { flex: 1, padding:5},

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    //marginRight: 8,
    paddingLeft:10,
    marginTop:20
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 60,
    borderRadius: 6,
    alignSelf: 'center',
  },
  smartQuizText: {
    marginTop: -8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
