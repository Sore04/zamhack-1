// Converted React Native constants file
import React from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

// Device and Screen Information
const { width, height } = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

// Platform Specific Constants
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Color Palette
const primaryColor = '#007AFF';
const secondaryColor = '#FF3B30';
const backgroundColor = '#FFFFFF';
const textColor = '#000000';
const lightGray = '#D3D3D3';
const darkGray = '#808080';

// Font Family (Example - you might need to load fonts using expo-font)
const regularFont = 'System'; // Default system font.  Consider using expo-font for custom fonts.
const boldFont = 'System'; // Default system font.  Consider using expo-font for custom fonts.

// API Endpoints (Example - replace with your actual API URLs)
const API_BASE_URL = 'https://your-api-base-url.com';
const LOGIN_ENDPOINT = `${API_BASE_URL}/login`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/register`;

// App-Specific Constants
const APP_NAME = 'YourAppName';
const APP_VERSION = '1.0.0';

// Layout Constants
const SPACING = 20;
const BORDER_RADIUS = 10;

// Responsive Font Sizes (using react-native-responsive-fontsize)
const RF_SMALL = RFValue(12);
const RF_MEDIUM = RFValue(16);
const RF_LARGE = RFValue(20);

// Example of a platform-specific value
const shadowOffset = Platform.select({
  ios: { width: 0, height: 2 },
  android: { width: 0, height: 2 }, // Adjust elevation for Android
});

export const CONSTANTS = {
  // Device Information
  SCREEN_WIDTH: width,
  SCREEN_HEIGHT: height,
  STATUS_BAR_HEIGHT: statusBarHeight,

  // Platform Information
  IS_IOS: isIOS,
  IS_ANDROID: isAndroid,

  // Color Palette
  PRIMARY_COLOR: primaryColor,
  SECONDARY_COLOR: secondaryColor,
  BACKGROUND_COLOR: backgroundColor,
  TEXT_COLOR: textColor,
  LIGHT_GRAY: lightGray,
  DARK_GRAY: darkGray,

  // Font Families
  REGULAR_FONT: regularFont,
  BOLD_FONT: boldFont,

  // API Endpoints
  API_BASE_URL: API_BASE_URL,
  LOGIN_ENDPOINT: LOGIN_ENDPOINT,
  REGISTER_ENDPOINT: REGISTER_ENDPOINT,

  // App Information
  APP_NAME: APP_NAME,
  APP_VERSION: APP_VERSION,

  // Layout Constants
  SPACING: SPACING,
  BORDER_RADIUS: BORDER_RADIUS,

  // Responsive Font Sizes
  RF_SMALL: RF_SMALL,
  RF_MEDIUM: RF_MEDIUM,
  RF_LARGE: RF_LARGE,

  // Platform-Specific Styles
  SHADOW_OFFSET: shadowOffset,
};