// Converted React Native constants file
import React from 'react';
import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width, height } = Dimensions.get('window');

// Platform-specific header height adjustment
const headerHeightAdjustment = Platform.OS === 'ios' ? getStatusBarHeight() : StatusBar.currentHeight || 0;

export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#FF3B30',
    background: '#FFFFFF',
    text: '#000000',
    lightGray: '#D3D3D3',
    darkGray: '#A9A9A9',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    white: '#FFFFFF',
    black: '#000000',
    offWhite: '#F0F0F0',
  },
  fonts: {
    regular: 'System', // Default system font
    medium: 'System', // You might need to use a custom font for medium weight
    bold: 'System',    // You might need to use a custom font for bold weight
    light: 'System',   // You might need to use a custom font for light weight
  },
  fontSizes: {
    small: RFValue(12),
    medium: RFValue(16),
    large: RFValue(20),
    xLarge: RFValue(24),
    title: RFValue(32),
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xLarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  screen: {
    width,
    height,
    headerHeight: 56 + headerHeightAdjustment, // Standard header height + platform adjustment
    safeAreaViewTop: headerHeightAdjustment,
    safeAreaViewBottom: 0, // Adjust if needed for bottom navigation bars
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  opacity: {
    disabled: 0.5,
    active: 0.9,
  },
  borderWidth: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
  animation: {
    duration: {
      short: 250,
      medium: 500,
      long: 1000,
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  hitSlop: {
    small: { top: 8, bottom: 8, left: 8, right: 8 },
    medium: { top: 16, bottom: 16, left: 16, right: 16 },
    large: { top: 24, bottom: 24, left: 24, right: 24 },
  },
  statusBar: {
    height: headerHeightAdjustment,
  },
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: theme.screen.safeAreaViewTop,
    height: theme.screen.headerHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: theme.colors.primary,
  },
  buttonClose: {
    backgroundColor: theme.colors.secondary,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export const CONSTANTS = {
  // App constants
  APP_NAME: 'MyReactNativeApp',
  API_BASE_URL: 'https://api.example.com',
  DEFAULT_TIMEOUT: 10000, // milliseconds
  // Add more constants as needed
};