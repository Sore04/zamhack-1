import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export const useApi = <T>(url: string) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(
    async (options: ApiOptions = {}) => {
      setState((prevState) => ({ ...prevState, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: options.headers,
          body: options.body ? JSON.stringify(options.body) : null,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: T = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error: any) {
        console.error('API Error:', error);
        setState({ data: null, loading: false, error: error.message });
        Alert.alert('Error', 'Failed to fetch data. Please try again.'); // User-friendly error message
      }
    },
    [url]
  );

  useEffect(() => {
    fetchData(); // Initial data fetch on mount
  }, [fetchData]);

  const mutateData = useCallback(
    async (options: ApiOptions) => {
      setState((prevState) => ({ ...prevState, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          method: options.method || 'POST', // Default to POST for mutations
          headers: {
            'Content-Type': 'application/json', // Ensure content type is set for mutations
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : null,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: T = await response.json();
        setState({ data, loading: false, error: null });
        return data; // Return the mutated data
      } catch (error: any) {
        console.error('API Mutation Error:', error);
        setState({ data: null, loading: false, error: error.message });
        Alert.alert('Error', 'Failed to update data. Please try again.'); // User-friendly error message
        throw error; // Re-throw the error for the caller to handle if needed
      } finally {
        setState((prevState) => ({ ...prevState, loading: false })); // Ensure loading is always set to false
      }
    },
    [url]
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchData,
    mutateData,
  };
};