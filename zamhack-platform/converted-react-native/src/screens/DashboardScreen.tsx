import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, RefreshControl, Dimensions, Platform,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import assets
import logo from '../../assets/images/logo.png'; // Example logo import

// Dummy Data (Replace with actual API calls)
const dummyHackathons = [
  { id: '1', name: 'Hackathon A', status: 'Ongoing', progress: 0.6 },
  { id: '2', name: 'Hackathon B', status: 'Upcoming', progress: 0 },
  { id: '3', name: 'Hackathon C', status: 'Completed', progress: 1 },
];

const dummyTeam = {
  name: 'Team Awesome',
  members: ['Alice', 'Bob', 'Charlie'],
};

const dummySubmissions = [
  { id: '1', hackathon: 'Hackathon A', status: 'Submitted' },
  { id: '2', hackathon: 'Hackathon B', status: 'Not Submitted' },
];

const dummyResults = [
  { hackathon: 'Hackathon C', rank: 2 },
];

const dummyRecommendations = [
  { id: '4', name: 'Hackathon D', description: 'AI Hackathon' },
  { id: '5', name: 'Hackathon E', description: 'Web3 Hackathon' },
];

interface DashboardScreenProps {}

export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'Dashboard'>['navigation']>();
  const insets = useSafeAreaInsets();

  const [hackathons, setHackathons] = useState(dummyHackathons);
  const [team, setTeam] = useState(dummyTeam);
  const [submissions, setSubmissions] = useState(dummySubmissions);
  const [results, setResults] = useState(dummyResults);
  const [recommendations, setRecommendations] = useState(dummyRecommendations);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading state

  // Simulate data fetching
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false);
      // In a real app, you would fetch data here
    }, 1000);
  }, []);

  const handleHackathonPress = (hackathonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('HackathonDetails', { hackathonId }); // Example navigation
  };

  const handleRecommendationPress = (hackathonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to hackathon details or registration page
    Alert.alert('Recommendation Pressed', `Navigating to hackathon ${hackathonId}`);
  };

  const renderHackathonItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.hackathonItem}
      onPress={() => handleHackathonPress(item.id)}
    >
      <Text style={styles.hackathonName}>{item.name}</Text>
      <Text>Status: {item.status}</Text>
      {item.status === 'Ongoing' && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecommendationItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.recommendationItem}
      onPress={() => handleRecommendationPress(item.id)}
    >
      <Text style={styles.recommendationName}>{item.name}</Text>
      <Text>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Hackathons</Text>
          {hackathons.map(renderHackathonItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          <Text>Team Name: {team.name}</Text>
          <Text>Members: {team.members.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submissions</Text>
          {submissions.map((submission) => (
            <Text key={submission.id}>
              {submission.hackathon}: {submission.status}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          {results.map((result) => (
            <Text key={result.hackathon}>
              {result.hackathon}: Rank {result.rank}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Hackathons</Text>
          {recommendations.map(renderRecommendationItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3498db',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  hackathonItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hackathonName: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2ecc71',
    borderRadius: 4,
  },
  recommendationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;