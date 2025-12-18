// Converted React Native utils file
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// React Native utility functions
export const validation = {
  /**
   * Checks if a string is a valid email address.
   * @param email The email address to validate.
   * @returns True if the email is valid, false otherwise.
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Checks if a string is a valid phone number.
   * @param phoneNumber The phone number to validate.
   * @returns True if the phone number is valid, false otherwise.
   */
  isValidPhoneNumber: (phoneNumber: string): boolean => {
    // Basic phone number validation (numbers and optional hyphens/spaces)
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return phoneRegex.test(phoneNumber);
  },

  /**
   * Checks if a string is a valid password.
   * @param password The password to validate.
   * @returns True if the password is valid, false otherwise.
   * Requirements:
   * - At least 8 characters long
   * - Contains at least one uppercase letter
   * - Contains at least one lowercase letter
   * - Contains at least one number
   * - Contains at least one special character
   */
  isValidPassword: (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Checks if a string is empty or contains only whitespace.
   * @param str The string to check.
   * @returns True if the string is empty or contains only whitespace, false otherwise.
   */
  isEmpty: (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    return str.trim().length === 0;
  },

  /**
   * Checks if a value is a valid number.
   * @param value The value to check.
   * @returns True if the value is a valid number, false otherwise.
   */
  isNumber: (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Checks if a value is a valid integer.
   * @param value The value to check.
   * @returns True if the value is a valid integer, false otherwise.
   */
  isInteger: (value: any): boolean => {
    return Number.isInteger(value);
  },

  /**
   * Checks if a value is a valid date.
   * @param value The value to check.
   * @returns True if the value is a valid date, false otherwise.
   */
  isValidDate: (value: any): boolean => {
    return value instanceof Date && !isNaN(value.getTime());
  },

  /**
   * Compares two values to check if they are equal.
   * @param value1 The first value to compare.
   * @param value2 The second value to compare.
   * @returns True if the values are equal, false otherwise.
   */
  isEqual: (value1: any, value2: any): boolean => {
    return value1 === value2;
  },

  /**
   * Checks if a value is within a specified range.
   * @param value The value to check.
   * @param min The minimum value of the range.
   * @param max The maximum value of the range.
   * @returns True if the value is within the range, false otherwise.
   */
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Checks if a string is a valid URL.
   * @param url The URL to validate.
   * @returns True if the URL is valid, false otherwise.
   */
  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Retrieves data from AsyncStorage.
   * @param key The key to retrieve the data from.
   * @returns A promise that resolves with the data, or null if the key does not exist.
   */
  getData: async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
      return null;
    } catch (e) {
      console.error('Error getting data from AsyncStorage:', e);
      return null;
    }
  },

  /**
   * Stores data in AsyncStorage.
   * @param key The key to store the data under.
   * @param value The data to store.
   * @returns A promise that resolves when the data is stored.
   */
  storeData: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error storing data in AsyncStorage:', e);
    }
  },

  /**
   * Removes data from AsyncStorage.
   * @param key The key to remove the data from.
   * @returns A promise that resolves when the data is removed.
   */
  removeData: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data from AsyncStorage:', e);
    }
  },

  /**
   * Clears all data from AsyncStorage. Use with caution!
   * @returns A promise that resolves when all data is cleared.
   */
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing all data from AsyncStorage:', e);
    }
  },

  /**
   * Validates if a string contains only letters.
   * @param str The string to validate.
   * @returns True if the string contains only letters, false otherwise.
   */
  isLettersOnly: (str: string): boolean => {
    const lettersRegex = /^[a-zA-Z]+$/;
    return lettersRegex.test(str);
  },

  /**
   * Validates if a string contains only numbers.
   * @param str The string to validate.
   * @returns True if the string contains only numbers, false otherwise.
   */
  isNumbersOnly: (str: string): boolean => {
    const numbersRegex = /^[0-9]+$/;
    return numbersRegex.test(str);
  },

  /**
   * Validates if a string is a valid postal code.
   * @param postalCode The postal code to validate.
   * @returns True if the postal code is valid, false otherwise.
   */
  isValidPostalCode: (postalCode: string): boolean => {
    // Basic postal code validation (numbers and optional hyphens/spaces)
    const postalCodeRegex = /^[0-9]{5}(?:-[0-9]{4})?$/; // US postal code
    return postalCodeRegex.test(postalCode);
  },

  /**
   * Validates if a string is a valid credit card number.
   * @param creditCardNumber The credit card number to validate.
   * @returns True if the credit card number is valid, false otherwise.
   */
  isValidCreditCardNumber: (creditCardNumber: string): boolean => {
    // Remove spaces and hyphens
    const cleanedCreditCardNumber = creditCardNumber.replace(/[\s-]+/g, '');

    // Check if the number is composed of digits only
    if (!/^\d+$/.test(cleanedCreditCardNumber)) {
      return false;
    }

    // Check if the number is of a valid length
    const length = cleanedCreditCardNumber.length;
    if (length < 12 || length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let alternate = false;
    for (let i = length - 1; i >= 0; i--) {
      let n = parseInt(cleanedCreditCardNumber.substring(i, i + 1), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      sum += n;
      alternate = !alternate;
    }
    return (sum % 10 === 0);
  },

  /**
   * Validates if a string is a valid CVV.
   * @param cvv The CVV to validate.
   * @returns True if the CVV is valid, false otherwise.
   */
  isValidCVV: (cvv: string): boolean => {
    const cvvRegex = /^[0-9]{3,4}$/;
    return cvvRegex.test(cvv);
  },

  /**
   * Validates if a string is a valid expiration date.
   * @param expirationDate The expiration date to validate.
   * @returns True if the expiration date is valid, false otherwise.
   */
  isValidExpirationDate: (expirationDate: string): boolean => {
    // Basic format validation (MM/YY or MM/YYYY)
    const expirationDateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/;
    if (!expirationDateRegex.test(expirationDate)) {
      return false;
    }

    const parts = expirationDate.split('/');
    const month = parseInt(parts[0], 10);
    let year = parseInt(parts[1], 10);

    if (year < 100) {
      year += 2000; // Assuming 21st century
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  },
};