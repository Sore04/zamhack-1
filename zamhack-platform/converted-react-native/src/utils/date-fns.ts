// Converted React Native utils file
import React from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

// React Native utility functions
export const dateFns = {
  formatDate: (date: Date | string | number, formatStr = 'MMMM dd, yyyy'): string => {
    try {
      if (typeof date === 'string') {
        date = parseISO(date);
      }
      return format(date, formatStr);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  },

  formatDistance: (date: Date | string | number): string => {
    try {
      if (typeof date === 'string') {
        date = parseISO(date);
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (error) {
      console.error("Error formatting distance:", error);
      return 'Invalid Date';
    }
  },

  parseDate: (dateString: string): Date | null => {
    try {
      return parseISO(dateString);
    } catch (error) {
      console.error("Error parsing date string:", error);
      return null;
    }
  },

  isValidDate: (date: any): boolean => {
    try {
      if (date instanceof Date) {
        return !isNaN(date.getTime());
      } else if (typeof date === 'string') {
        const parsedDate = parseISO(date);
        return !isNaN(parsedDate.getTime());
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  isDateInFuture: (date: Date | string): boolean => {
    try {
      const inputDate = typeof date === 'string' ? parseISO(date) : date;
      return new Date(inputDate).getTime() > Date.now();
    } catch (error) {
      console.error("Error checking if date is in the future:", error);
      return false;
    }
  },

  isDateInPast: (date: Date | string): boolean => {
    try {
      const inputDate = typeof date === 'string' ? parseISO(date) : date;
      return new Date(inputDate).getTime() < Date.now();
    } catch (error) {
      console.error("Error checking if date is in the past:", error);
      return false;
    }
  },

  getStartOfDay: (date: Date | string): Date => {
    try {
      const inputDate = typeof date === 'string' ? parseISO(date) : date;
      const newDate = new Date(inputDate);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    } catch (error) {
      console.error("Error getting start of day:", error);
      return new Date(); // Return current date as fallback
    }
  },

  getEndOfDay: (date: Date | string): Date => {
    try {
      const inputDate = typeof date === 'string' ? parseISO(date) : date;
      const newDate = new Date(inputDate);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    } catch (error) {
      console.error("Error getting end of day:", error);
      return new Date(); // Return current date as fallback
    }
  },
};