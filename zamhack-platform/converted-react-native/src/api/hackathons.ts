// Converted React Native api file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import React from 'react';

const HACKATHONS_STORAGE_KEY = 'hackathons_data';

// Mock data for hackathons (replace with actual API endpoint)
const mockHackathons = [
  { id: '1', title: 'Awesome Hackathon 2024', description: 'A great hackathon!', startDate: '2024-03-15', endDate: '2024-03-17' },
  { id: '2', title: 'Another Hackathon', description: 'Another awesome hackathon.', startDate: '2024-04-01', endDate: '2024-04-03' },
];

const isAndroid = Platform.OS === 'android';

const api = {
  getHackathons: async (): Promise<any[]> => {
    try {
      // Check if data is cached
      const cachedData = await AsyncStorage.getItem(HACKATHONS_STORAGE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Simulate API call (replace with actual API endpoint)
      // const response = await fetch('https://your-api.com/hackathons');
      // const data = await response.json();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

      const data = mockHackathons; // Use mock data

      // Cache the data
      await AsyncStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(data));

      return data;
    } catch (error: any) {
      console.error('Error fetching hackathons:', error.message);

      // Handle network errors gracefully
      if (error.message === 'Network request failed') {
        // Provide a user-friendly message or fallback to cached data
        console.warn('Network error. Using cached data if available.');
        const cachedData = await AsyncStorage.getItem(HACKATHONS_STORAGE_KEY);
        if (cachedData) {
          return JSON.parse(cachedData);
        } else {
          // No cached data available, show an error message to the user
          throw new Error('No network connection and no cached data available.');
        }
      }

      // Re-throw the error to be handled by the calling component
      throw error;
    }
  },

  getHackathonById: async (id: string): Promise<any | null> => {
    try {
      const hackathons = await api.getHackathons();
      return hackathons.find(hackathon => hackathon.id === id) || null;
    } catch (error) {
      console.error('Error getting hackathon by ID:', error);
      throw error;
    }
  },

  createHackathon: async (hackathonData: any): Promise<any> => {
    try {
      // Simulate API call (replace with actual API endpoint)
      // const response = await fetch('https://your-api.com/hackathons', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(hackathonData),
      // });
      // const newHackathon = await response.json();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newHackathon = { ...hackathonData, id: String(Math.random()) }; // Mock ID generation

      // Update cached data
      const hackathons = await api.getHackathons();
      const updatedHackathons = [...hackathons, newHackathon];
      await AsyncStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(updatedHackathons));

      return newHackathon;
    } catch (error) {
      console.error('Error creating hackathon:', error);
      throw error;
    }
  },

  updateHackathon: async (id: string, hackathonData: any): Promise<any> => {
    try {
      // Simulate API call (replace with actual API endpoint)
      // const response = await fetch(`https://your-api.com/hackathons/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(hackathonData),
      // });
      // const updatedHackathon = await response.json();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedHackathon = { ...hackathonData, id: id }; // Ensure ID is present

      // Update cached data
      const hackathons = await api.getHackathons();
      const updatedHackathons = hackathons.map(hackathon =>
        hackathon.id === id ? updatedHackathon : hackathon
      );
      await AsyncStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(updatedHackathons));

      return updatedHackathon;
    } catch (error) {
      console.error('Error updating hackathon:', error);
      throw error;
    }
  },

  deleteHackathon: async (id: string): Promise<void> => {
    try {
      // Simulate API call (replace with actual API endpoint)
      // await fetch(`https://your-api.com/hackathons/${id}`, {
      //   method: 'DELETE',
      // });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update cached data
      const hackathons = await api.getHackathons();
      const updatedHackathons = hackathons.filter(hackathon => hackathon.id !== id);
      await AsyncStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(updatedHackathons));
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      throw error;
    }
  },

  clearCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(HACKATHONS_STORAGE_KEY);
      console.log('Hackathons cache cleared.');
    } catch (error) {
      console.error('Error clearing hackathons cache:', error);
      throw error;
    }
  },
};

export default api;