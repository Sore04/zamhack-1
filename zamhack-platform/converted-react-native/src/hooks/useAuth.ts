// hooks/useAuth.ts
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AuthState {
  isLoggedIn: boolean;
  user: any | null; // Replace 'any' with your user type
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Simulate fetching user data based on token (replace with your actual API call)
          const userData = await simulateFetchUserData(token);

          setAuthState({
            isLoggedIn: true,
            user: userData,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error('Error loading token:', error);
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
          error: 'Failed to load authentication data.',
        });
      }
    };

    loadToken();
  }, []);

  const login = async (credentials: any) => {
    setAuthState(prevState => ({ ...prevState, loading: true, error: null }));

    try {
      // Simulate API call for login (replace with your actual API call)
      const response = await simulateLogin(credentials);

      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        setAuthState({
          isLoggedIn: true,
          user: response.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
          error: response.message || 'Login failed.',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: 'Login failed. Please check your credentials and try again.',
      });
    }
  };

  const logout = async () => {
    setAuthState(prevState => ({ ...prevState, loading: true, error: null }));

    try {
      await AsyncStorage.removeItem('authToken');
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: 'Logout failed.',
      });
    }
  };

  // Simulate API calls (replace with your actual API calls)
  const simulateLogin = async (credentials: any) => {
    // Replace with your actual login logic
    if (credentials.username === 'user' && credentials.password === 'password') {
      return { success: true, token: 'fake_token', user: { id: 1, name: 'Test User' } };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const simulateFetchUserData = async (token: string) => {
    // Replace with your actual user data fetching logic
    return { id: 1, name: 'Test User' };
  };

  return {
    ...authState,
    login,
    logout,
  };
};