import React from 'react';
// Converted React Native constants file
import { Dimensions, Platform, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Device Information
const { width, height } = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

// Platform Specific Constants
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Color Palette
const COLORS = {
  primary: '#007AFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#343A40',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  // Add more colors as needed
};

// Font Family
const FONTS = {
  regular: 'System', // Default system font
  medium: 'System', // Default system font
  bold: 'System',   // Default system font
  // Add custom fonts if needed (require font files)
  // example: robotoRegular: 'Roboto-Regular',
};

// Font Sizes
const FONT_SIZES = {
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  title: 32,
  // Add more font sizes as needed
};

// Spacing
const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
  // Add more spacing values as needed
};

// Border Radius
const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  // Add more border radius values as needed
};

// Shadow
const SHADOW = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
};

// API Configuration (Example - replace with your actual API details)
const API_CONFIG = {
  baseURL: 'https://your-api-base-url.com',
  timeout: 10000, // milliseconds
  // Add any other API related configurations
};

// App Constants
export const CONSTANTS = {
  APP_NAME: 'Your App Name',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1', // Can be dynamically updated during build process
  // Add any other app-specific constants
};

// Theme (Example - can be expanded)
const THEME = {
  light: {
    backgroundColor: COLORS.white,
    textColor: COLORS.black,
    primaryColor: COLORS.primary,
    // Add more theme-specific values
  },
  dark: {
    backgroundColor: COLORS.dark,
    textColor: COLORS.white,
    primaryColor: COLORS.primary,
    // Add more theme-specific values
  },
};

// Export all constants
export {
  width,
  height,
  statusBarHeight,
  isIOS,
  isAndroid,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOW,
  API_CONFIG,
  THEME,
};