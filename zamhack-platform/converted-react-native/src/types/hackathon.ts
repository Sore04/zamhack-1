// Converted React Native types file
// React Native TypeScript types

import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ImageSourcePropType } from 'react-native';

// Define the RootStackParamList for navigation
export type RootStackParamList = {
  Home: undefined;
  Details: { hackathonId: string }; // Example: Passing hackathon ID to details screen
  CreateHackathon: undefined;
  EditHackathon: { hackathonId: string };
  // Add other screens and their parameters here
};

// Navigation prop for screens within the RootStack
export type ScreenNavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  T
>;

// Route prop for screens within the RootStack
export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

// Define the structure of a Hackathon object
export interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string; // Consider using Date type and converting to string for display
  endDate: string;   // Consider using Date type and converting to string for display
  location: string;
  organizer: string;
  contactEmail: string;
  website?: string; // Optional website URL
  imageUrl?: ImageSourcePropType; // URL or require('path/to/image')
  // Add other relevant fields
}

// Type for the Hackathon list (array of Hackathon objects)
export type HackathonList = Hackathon[];

// Example usage in a component:
// const MyComponent: React.FC<ScreenProps<'Home'>> = ({ navigation, route }) => { ... }
// where ScreenProps = { navigation: StackNavigationProp<RootStackParamList, ScreenName>; route: RouteProp<RootStackParamList, ScreenName>; }

// Type for API responses (example)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Type for form input changes
export interface InputChangeEvent {
  nativeEvent: {
    text: string;
  };
}

// Type for image selection
export interface ImagePickerResponse {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: {
    uri: string;
    width: number;
    height: number;
    fileSize: number;
    type: string;
    fileName: string;
  }[];
}