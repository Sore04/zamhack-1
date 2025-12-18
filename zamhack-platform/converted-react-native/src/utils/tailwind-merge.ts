// Converted React Native utils file
// React Native utility functions

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function to combine class names using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Example usage:
// <View style={styles.container} style={cn("bg-red-500", "p-4")}>

// React Native StyleSheet example
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
  },
  // Platform-specific styles
  ...(Platform.OS === 'ios'
    ? {
        iosSpecificStyle: {
          paddingTop: 20, // Example: Add padding for iOS status bar
        },
      }
    : {}),
  ...(Platform.OS === 'android'
    ? {
        androidSpecificStyle: {
          paddingBottom: 10, // Example: Add padding for Android navigation bar
        },
      }
    : {}),
});

export { styles };