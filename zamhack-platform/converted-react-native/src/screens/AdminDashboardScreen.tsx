import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, RefreshControl, Dimensions, Platform,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

// Import assets (if needed)
// import { images } from '../../assets';
import logo from '../../assets/images/logo.png'; // Example logo import

const { width, height } = Dimensions.get('window');

interface AdminDashboardScreenProps {}

interface DashboardItem {
  title: string;
  description: string;
  onPress: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'AdminDashboard'>['navigation']>();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      title: 'Manage Hackathons',
      description: 'Create, edit, and delete hackathons.',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('HackathonManagement'); // Replace with your actual screen name
      },
    },
    {
      title: 'Manage Users',
      description: 'View, edit, and manage user accounts.',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('UserManagement'); // Replace with your actual screen name
      },
    },
    {
      title: 'View Submissions',
      description: 'Review and manage hackathon submissions.',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('SubmissionManagement'); // Replace with your actual screen name
      },
    },
    {
      title: 'Push Notifications',
      description: 'Send notifications to users.',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('PushNotification'); // Replace with your actual screen name
      },
    },
    {
      title: 'Reporting & Analytics',
      description: 'View key metrics and insights.',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('Analytics'); // Replace with your actual screen name
      },
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching or any refresh logic here
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      Platform.OS === 'android' && StatusBar.setBackgroundColor('white');
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="white" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>

        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dashboardItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  dashboardItem: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AdminDashboardScreen;