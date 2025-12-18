// Converted React Native types file
// React Native TypeScript types
import { RouteProp, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ImageSourcePropType } from 'react-native';
import React from 'react';

// Define common types used throughout the app

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string; // URL or path to the profile picture
  // Add other user-related properties here
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  image?: ImageSourcePropType; // Use React Native's ImageSourcePropType
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other submission-related properties here
}

// Define navigation types for different screens

export type RootStackParamList = {
  Home: undefined;
  Details: { submissionId: string };
  CreateSubmission: undefined;
  EditSubmission: { submissionId: string };
  Profile: { userId: string };
  Login: undefined;
  Signup: undefined;
  // Add other screens and their parameters here
};

// Define route and navigation props for a specific screen (e.g., DetailsScreen)

export type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

export type DetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Details'
>;

export interface DetailsScreenProps {
  route: DetailsScreenRouteProp;
  navigation: DetailsScreenNavigationProp;
}

// Define route and navigation props for a specific screen (e.g., ProfileScreen)

export type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export interface ProfileScreenProps {
  route: ProfileScreenRouteProp;
  navigation: ProfileScreenNavigationProp;
}

// Example of a type for API responses (adapt to your specific API)

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example of a type for form input values

export interface SubmissionFormValues {
  title: string;
  description: string;
  image?: ImageSourcePropType;
}

// Type for handling image picker results
export interface ImagePickerResult {
  uri: string | null;
  type: string | null;
  name: string | null;
  width: number;
  height: number;
}

// Type for handling errors
export interface AppError {
  message: string;
  code?: string;
}