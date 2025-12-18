// Converted React Native utils file
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

export const api = {
  /**
   * Saves data to AsyncStorage.
   * @param key The key to store the data under.
   * @param value The data to store (must be stringifiable).
   */
  async saveData(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error saving data to AsyncStorage:', e);
      Alert.alert('Error', 'Failed to save data.');
    }
  },

  /**
   * Retrieves data from AsyncStorage.
   * @param key The key to retrieve the data from.
   * @returns The retrieved data, or null if not found.
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error getting data from AsyncStorage:', e);
      Alert.alert('Error', 'Failed to retrieve data.');
      return null;
    }
  },

  /**
   * Removes data from AsyncStorage.
   * @param key The key to remove.
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data from AsyncStorage:', e);
      Alert.alert('Error', 'Failed to remove data.');
    }
  },

  /**
   * Opens the document picker and returns the selected file's URI.
   * @returns The URI of the selected file, or null if no file was selected.
   */
  async pickDocument(): Promise<string | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true, // Required for accessing the file on iOS
      });

      if (result.type === 'success') {
        return result.uri;
      } else {
        return null; // User cancelled the picker
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document.');
      return null;
    }
  },

  /**
   * Reads the content of a file from its URI.
   * @param uri The URI of the file to read.
   * @returns The content of the file as a string, or null if an error occurred.
   */
  async readFileContent(uri: string): Promise<string | null> {
    try {
      const content = await FileSystem.readAsStringAsync(uri);
      return content;
    } catch (err) {
      console.error('Error reading file content:', err);
      Alert.alert('Error', 'Failed to read file content.');
      return null;
    }
  },

  /**
   * Writes content to a file in the app's cache directory.
   * @param filename The name of the file to create.
   * @param content The content to write to the file.
   * @returns The URI of the created file, or null if an error occurred.
   */
  async writeFileContent(filename: string, content: string): Promise<string | null> {
    try {
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);
      return fileUri;
    } catch (err) {
      console.error('Error writing file content:', err);
      Alert.alert('Error', 'Failed to write file content.');
      return null;
    }
  },

  /**
   * Checks if the app is running on Android.
   * @returns True if the app is running on Android, false otherwise.
   */
  isAndroid(): boolean {
    return Platform.OS === 'android';
  },

  /**
   * Checks if the app is running on iOS.
   * @returns True if the app is running on iOS, false otherwise.
   */
  isIOS(): boolean {
    return Platform.OS === 'ios';
  },

  /**
   * Gets the platform the app is running on.
   * @returns The platform the app is running on ('android' or 'ios').
   */
  getPlatform(): string {
    return Platform.OS;
  },

  /**
   * Downloads a file from a URL to the device's file system.
   * @param url The URL of the file to download.
   * @param filename The name to give the downloaded file.
   * @returns The local URI of the downloaded file, or null if the download failed.
   */
  async downloadFile(url: string, filename: string): Promise<string | null> {
    try {
      const fileUri = FileSystem.documentDirectory + filename; // Or use cacheDirectory
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (progress) => {
          // Optional: Track download progress
          const totalBytes = progress.totalBytesExpectedToWrite;
          const receivedBytes = progress.totalBytesWritten;
          console.log(`Download progress: ${receivedBytes} / ${totalBytes}`);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      return uri;
    } catch (e) {
      console.error('Error downloading file:', e);
      Alert.alert('Error', 'Failed to download file.');
      return null;
    }
  },

  /**
   * Deletes a file from the device's file system.
   * @param fileUri The URI of the file to delete.
   * @returns True if the file was successfully deleted, false otherwise.
   */
  async deleteFile(fileUri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(fileUri);
      return true;
    } catch (e) {
      console.error('Error deleting file:', e);
      Alert.alert('Error', 'Failed to delete file.');
      return false;
    }
  },
};