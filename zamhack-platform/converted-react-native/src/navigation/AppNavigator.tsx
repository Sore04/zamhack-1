import TeamScreen from '../screens/TeamScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import JudgingScreen from '../screens/JudgingScreen';
import HomeScreen from '../screens/HomeScreen';
import HackathonDetailsScreen from '../screens/HackathonDetailsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator(); createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): JSX.Element {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4f3f4',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="Registration" 
        component={RegistrationScreen}
        options={{ title: 'Registration' }}
      />
      <Stack.Screen 
        name="HackathonDetails" 
        component={HackathonDetailsScreen}
        options={{ title: 'HackathonDetails' }}
      />
      <Stack.Screen 
        name="Team" 
        component={TeamScreen}
        options={{ title: 'Team' }}
      />
      <Stack.Screen 
        name="Submission" 
        component={SubmissionScreen}
        options={{ title: 'Submission' }}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'AdminDashboard' }}
      />
      <Stack.Screen 
        name="Judging" 
        component={JudgingScreen}
        options={{ title: 'Judging' }}
      />
      {/* Add more screens here */}
    </Stack.Navigator>
  );
}