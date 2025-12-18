// Converted React Native types file
// React Native TypeScript types

import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Define root stack params for navigation
export type RootStackParamList = {
  Home: undefined;
  Details: { itemId: string }; // Example: Passing an item ID to the Details screen
  Settings: undefined;
  // Add more screens and their parameters here
};

// Screen props for Home screen
export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

// Screen props for Details screen
export type DetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Details'
>;

// Route props for Details screen (alternative to using NativeStackScreenProps)
export type DetailsRouteProps = RouteProp<RootStackParamList, 'Details'>;

// Screen props for Settings screen
export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

// Example API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

// Example data type for an item
export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Consider using a URI type for images
  price: number;
  // Add more properties as needed
}

// Example type for user data
export interface User {
  userId: string;
  username: string;
  email: string;
  profilePicture?: string; // URI type for profile picture
  // Add more user properties
}

// Example type for settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  // Add more settings properties
}

// Type for handling image URI
export type ImageSource = {
  uri: string;
};

// Type for handling network errors
export interface NetworkError {
  code: string;
  message: string;
}

// Type for handling form input changes
export interface InputChangeEvent {
  nativeEvent: {
    text: string;
  };
}

// Type for handling button press events
export interface ButtonPressEvent {
  preventDefault: () => void;
}

// Type for handling touch events
export interface TouchEvent {
  nativeEvent: {
    locationX: number;
    locationY: number;
  };
}