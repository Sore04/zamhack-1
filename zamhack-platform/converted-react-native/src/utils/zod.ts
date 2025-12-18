// Converted React Native utils file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import React from 'react';

export const zod = {
  /**
   * Stores data in AsyncStorage.
   * @param key The key to store the data under.
   * @param value The data to store (must be stringifiable).
   */
  storeData: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error storing data:', e);
      // Consider throwing the error or handling it more gracefully in your app
      throw new Error(`Failed to store data for key ${key}: ${e}`);
    }
  },

  /**
   * Retrieves data from AsyncStorage.
   * @param key The key to retrieve the data for.
   * @returns The retrieved data, or null if not found.
   */
  getData: async (key: string): Promise<any | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error getting data:', e);
      // Consider throwing the error or handling it more gracefully in your app
      return null; // Or throw an error, depending on your needs
    }
  },

  /**
   * Removes data from AsyncStorage.
   * @param key The key to remove.
   */
  removeData: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data:', e);
      // Consider throwing the error or handling it more gracefully in your app
      throw new Error(`Failed to remove data for key ${key}: ${e}`);
    }
  },

  /**
   * Checks if the app is running on Android.
   * @returns True if the app is running on Android, false otherwise.
   */
  isAndroid: (): boolean => {
    return Platform.OS === 'android';
  },

  /**
   * Checks if the app is running on iOS.
   * @returns True if the app is running on iOS, false otherwise.
   */
  isIOS: (): boolean => {
    return Platform.OS === 'ios';
  },

  /**
   * Gets the platform the app is running on.
   * @returns 'android', 'ios', or 'web'.
   */
  getPlatform: (): string => {
    return Platform.OS;
  },

  /**
   * Debounces a function.  Useful for rate-limiting events.
   * @param func The function to debounce.
   * @param delay The delay in milliseconds.
   * @returns A debounced version of the function.
   */
  debounce: (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  },

  /**
   * Throttles a function.  Useful for rate-limiting events.
   * @param func The function to throttle.
   * @param limit The time limit in milliseconds.
   * @returns A throttled version of the function.
   */
  throttle: (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;

    return function(this: any, ...args: any) {
      if (!inThrottle) {
        func.apply(this, args);
        lastRan = Date.now();
        inThrottle = true;
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },

  /**
   * Generates a random ID.
   * @returns A random ID string.
   */
  generateId: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  /**
   * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
   * @param value The value to check.
   * @returns True if the value is empty, false otherwise.
   */
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  },

  /**
   * Waits for a specified amount of time.
   * @param ms The number of milliseconds to wait.
   * @returns A promise that resolves after the specified time.
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};