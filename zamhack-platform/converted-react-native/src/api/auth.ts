// Converted React Native api file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

// Utility function to check network connectivity
const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isInternetReachable || false;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false; // Assume no network if there's an error
  }
};

// Generic API request function with error handling and offline support
const apiRequest = async <T>(
  url: string,
  method: string = 'GET',
  body: any = null,
  headers: Record<string, string> = {}
): Promise<T> => {
  if (!(await isNetworkAvailable())) {
    throw new Error('No internet connection. Please try again later.');
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} - ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage += ` - ${errorBody.message || JSON.stringify(errorBody)}`;
      } catch (jsonError) {
        console.warn("Failed to parse error response as JSON:", jsonError);
      }
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error: any) {
    console.error(`API request failed for ${url}:`, error);
    throw new Error(`API request failed: ${error.message || error}`);
  }
};

// Authentication functions using SecureStore
const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw new Error('Failed to save authentication token.');
  }
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

const deleteAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Error deleting auth token:', error);
    throw new Error('Failed to delete authentication token.');
  }
};

// Example API methods (replace with your actual API calls)
export const api = {
  login: async (credentials: any): Promise<any> => {
    const response = await apiRequest<any>('/api/login', 'POST', credentials);
    await saveAuthToken(response.token); // Assuming the API returns a token
    return response;
  },

  logout: async (): Promise<void> => {
    // Optionally call an API endpoint to invalidate the token on the server
    // await apiRequest('/api/logout', 'POST');
    await deleteAuthToken();
  },

  register: async (userData: any): Promise<any> => {
    return await apiRequest<any>('/api/register', 'POST', userData);
  },

  getUserProfile: async (): Promise<any> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
    return await apiRequest<any>('/api/profile', 'GET', null, {
      Authorization: `Bearer ${token}`,
    });
  },

  updateUserProfile: async (profileData: any): Promise<any> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
    return await apiRequest<any>('/api/profile', 'PUT', profileData, {
      Authorization: `Bearer ${token}`,
    });
  },

  // Example of fetching data
  fetchData: async (): Promise<any> => {
    return await apiRequest<any>('/api/data', 'GET');
  },

  // Example of posting data
  postData: async (data: any): Promise<any> => {
    return await apiRequest<any>('/api/data', 'POST', data);
  },
};