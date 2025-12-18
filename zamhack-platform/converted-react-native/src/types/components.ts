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

// Screen props for the Home screen
export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

// Screen props for the Details screen
export type DetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Details'
>;

// Route props for the Details screen (alternative to NativeStackScreenProps)
export type DetailsRouteProps = RouteProp<RootStackParamList, 'Details'>;

// Screen props for the Settings screen
export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

// Example: Type definition for an item
export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Optional image URL
  // Add more properties as needed
}

// Example: Type definition for API response
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

// Example: Type definition for a component's props
export interface CustomComponentProps {
  title: string;
  onPress: () => void;
  style?: any; // Use 'any' or define a more specific style type
}

// Example: Type definition for a user object
export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  // Add more user properties as needed
}

// Example: Type definition for authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Example: Type definition for context value
export interface AuthContextValue {
  state: AuthState;
  login: (userData: any) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

// Example: Type definition for form input
export interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
}

// Example: Type definition for a list item
export interface ListItemProps {
  item: Item;
  onPress: (itemId: string) => void;
}