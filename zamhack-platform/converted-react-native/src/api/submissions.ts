// Converted React Native api file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import React from 'react';

// Define a base URL for your API.  Consider using environment variables.
const BASE_URL = 'https://your-api-endpoint.com'; // Replace with your actual API endpoint

// Helper function to handle network requests and errors
const handleRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text(); // Or handle other content types as needed
    }
  } catch (error: any) {
    // Handle network errors (e.g., no internet connection)
    console.error('Network error:', error);
    throw new Error(`Network error: ${error.message}`); // Re-throw for component-level handling
  }
};

// Example API functions (replace with your actual API calls)
export const api = {
  getSubmissions: async () => {
    const url = `${BASE_URL}/submissions`;
    try {
      const data = await handleRequest(url);
      return data;
    } catch (error) {
      // Consider logging the error or displaying a user-friendly message
      console.error('Error fetching submissions:', error);
      throw error; // Re-throw the error for the calling component to handle
    }
  },

  getSubmission: async (id: string) => {
    const url = `${BASE_URL}/submissions/${id}`;
    try {
      const data = await handleRequest(url);
      return data;
    } catch (error) {
      console.error(`Error fetching submission with ID ${id}:`, error);
      throw error;
    }
  },

  createSubmission: async (submissionData: any) => {
    const url = `${BASE_URL}/submissions`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    };

    try {
      const data = await handleRequest(url, options);
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  updateSubmission: async (id: string, submissionData: any) => {
    const url = `${BASE_URL}/submissions/${id}`;
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    };

    try {
      const data = await handleRequest(url, options);
      return data;
    } catch (error) {
      console.error(`Error updating submission with ID ${id}:`, error);
      throw error;
    }
  },

  deleteSubmission: async (id: string) => {
    const url = `${BASE_URL}/submissions/${id}`;
    const options = {
      method: 'DELETE',
    };

    try {
      await handleRequest(url, options);
      return; // Or return a success message if needed
    } catch (error) {
      console.error(`Error deleting submission with ID ${id}:`, error);
      throw error;
    }
  },

  // Example of using AsyncStorage for caching (optional)
  getCachedSubmissions: async () => {
    try {
      const cachedData = await AsyncStorage.getItem('submissions');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached submissions:', error);
      return null;
    }
  },

  setCachedSubmissions: async (submissions: any) => {
    try {
      await AsyncStorage.setItem('submissions', JSON.stringify(submissions));
    } catch (error) {
      console.error('Error caching submissions:', error);
    }
  },

  // Example of file upload (using FormData) - requires expo-document-picker and expo-file-system
  uploadFile: async (fileUri: string, fileName: string) => {
    if (Platform.OS === 'web') {
      console.warn("File uploads are not fully supported in web environment for React Native.  Consider a different approach.");
      return;
    }

    const url = `${BASE_URL}/upload`; // Replace with your upload endpoint
    const formData = new FormData();

    // Append the file to the FormData object
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg', // Adjust the type based on the file type
    } as any);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    };

    try {
      const data = await handleRequest(url, options);
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
};