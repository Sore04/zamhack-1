// Converted React Native api file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import React from 'react';

const API_BASE_URL = 'https://your-api-base-url.com'; // Replace with your actual API base URL

// Utility function for handling network requests
const handleRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text(); // Or handle other content types as needed
    }
  } catch (error: any) {
    console.error('API Request Error:', error);

    // Mobile-specific error handling (e.g., check for network connectivity)
    if (error.message === 'Network request failed') {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw error; // Re-throw the error for the calling function to handle
  }
};

// Example API functions
export const api = {
  getUsers: async () => {
    const url = `${API_BASE_URL}/users`;
    return handleRequest(url);
  },

  getUser: async (id: string) => {
    const url = `${API_BASE_URL}/users/${id}`;
    return handleRequest(url);
  },

  createUser: async (userData: any) => {
    const url = `${API_BASE_URL}/users`;
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };
    return handleRequest(url, options);
  },

  updateUser: async (id: string, userData: any) => {
    const url = `${API_BASE_URL}/users/${id}`;
    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };
    return handleRequest(url, options);
  },

  deleteUser: async (id: string) => {
    const url = `${API_BASE_URL}/users/${id}`;
    const options: RequestInit = {
      method: 'DELETE',
    };
    return handleRequest(url, options);
  },

  // Example function using AsyncStorage for local data persistence
  storeUserToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error storing user token:', error);
      throw error;
    }
  },

  getUserToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  },

  clearUserToken: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Error clearing user token:', error);
      throw error;
    }
  },

  // Example function to check platform
  getPlatform: () => {
    return Platform.OS; // 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux'
  },
};