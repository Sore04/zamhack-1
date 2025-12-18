// Converted React Native types file

import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the RootStackParamList for navigation
export type RootStackParamList = {
  Home: undefined;
  Details: { userId: string }; // Example: Passing userId to Details screen
  CreateUser: undefined;
  EditUser: { userId: string };
};

// Define screen props using NativeStackScreenProps
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
export type CreateUserScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateUser'>;
export type EditUserScreenProps = NativeStackScreenProps<RootStackParamList, 'EditUser'>;

// Define the User type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// Define the type for the API response (adjust based on your actual API)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Example type for form values (using React Hook Form or similar)
export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

// Type for a list of users
export type UserList = User[];

// Type for context (if you're using Context API)
export interface UserContextType {
  users: UserList;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (user: UserFormValues) => Promise<void>;
  updateUser: (userId: string, user: UserFormValues) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

// Type for navigation prop with params
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackScreenProps<RootStackParamList, T>['navigation'];
  route: NativeStackScreenProps<RootStackParamList, T>['route'];
};