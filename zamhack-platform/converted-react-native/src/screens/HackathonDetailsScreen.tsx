import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Linking, RefreshControl, Platform, Dimensions,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import MapView, { Marker } from 'react-native-maps';
import * as Calendar from 'expo-calendar';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import assets (if needed)
import logo from '../../assets/images/logo.png'; // Example logo import

interface HackathonDetailsScreenProps {}

// Mock Hackathon Data (Replace with API call)
const mockHackathonData = {
  id: '1',
  title: 'Awesome Hackathon 2024',
  description:
    'Join us for a weekend of coding, collaboration, and innovation! Build amazing projects, learn new skills, and compete for awesome prizes.',
  rules: [
    'Teams of 1-4 people',
    'Projects must be original',
    'Must use at least one sponsor API',
    'Respect the code of conduct',
  ],
  prizes: [
    '1st Place: $5000',
    '2nd Place: $2500',
    '3rd Place: $1000',
    'Best Use of Sponsor API: $500',
  ],
  schedule: [
    { time: 'Friday 6:00 PM', event: 'Check-in & Opening Ceremony' },
    { time: 'Friday 7:00 PM', event: 'Team Formation & Brainstorming' },
    { time: 'Saturday 9:00 AM', event: 'Hacking Begins' },
    { time: 'Sunday 12:00 PM', event: 'Submission Deadline' },
    { time: 'Sunday 2:00 PM', event: 'Judging' },
    { time: 'Sunday 4:00 PM', event: 'Awards Ceremony' },
  ],
  sponsors: ['Google', 'Microsoft', 'Amazon', 'Facebook'],
  website: 'https://example.com/hackathon',
  venue: {
    name: 'Tech Conference Center',
    address: '123 Main Street, Anytown, USA',
    latitude: 37.78825,
    longitude: -122.4324,
  },
  startDate: new Date('2024-10-27T09:00:00'),
  endDate: new Date('2024-10-29T17:00:00'),
};

export const HackathonDetailsScreen: React.FC<HackathonDetailsScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'HackathonDetails'>['navigation']>();
  const [hackathon, setHackathon] = useState(mockHackathonData); // Replace with API call later
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Function to fetch hackathon data (replace mock data)
  const fetchHackathonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Replace with actual API call
      setHackathon(mockHackathonData);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch hackathon details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathonData();
  }, [fetchHackathonData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHackathonData().finally(() => setRefreshing(false));
  }, [fetchHackathonData]);

  const handleWebsiteLink = () => {
    if (hackathon.website) {
      Linking.openURL(hackathon.website);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleAddToCalendar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.DEFAULT_CALENDAR);
        const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];

        if (!defaultCalendar) {
          Alert.alert('Error', 'No default calendar found.');
          return;
        }

        const eventDetails = {
          title: hackathon.title,
          startDate: hackathon.startDate,
          endDate: hackathon.endDate,
          timeZone: 'America/Los_Angeles', // Replace with user's timezone or hackathon timezone
          location: hackathon.venue.address,
          notes: hackathon.description,
          calendarId: defaultCalendar.id,
        };

        const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);

        Alert.alert('Success', 'Event added to calendar!');
      } else {
        Alert.alert('Error', 'Calendar permission not granted.');
      }
    } catch (error: any) {
      console.error('Calendar Error:', error);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading Hackathon Details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>Error: {error}</Text>
        <TouchableOpacity onPress={fetchHackathonData}>
          <Text style={styles.retryButton}>Retry</Text>
        </TouchableOpacity>
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
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>{hackathon.title}</Text>
        <Text style={styles.description}>{hackathon.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {hackathon.rules.map((rule, index) => (
            <Text key={index} style={styles.listItem}>
              - {rule}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prizes</Text>
          {hackathon.prizes.map((prize, index) => (
            <Text key={index} style={styles.listItem}>
              - {prize}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {hackathon.schedule.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={styles.scheduleEvent}>{item.event}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sponsors</Text>
          <View style={styles.sponsorsContainer}>
            {hackathon.sponsors.map((sponsor, index) => (
              <Text key={index} style={styles.sponsorItem}>
                {sponsor}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <Text style={styles.venueName}>{hackathon.venue.name}</Text>
          <Text style={styles.venueAddress}>{hackathon.venue.address}</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: hackathon.venue.latitude,
              longitude: hackathon.venue.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: hackathon.venue.latitude,
                longitude: hackathon.venue.longitude,
              }}
              title={hackathon.venue.name}
              description={hackathon.venue.address}
            />
          </MapView>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleWebsiteLink}>
          <Text style={styles.buttonText}>Visit Website</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddToCalendar}>
          <Text style={styles.buttonText}>Add to Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    color: 'blue',
    marginTop: 10,
  },
  scrollViewContent: {
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'justify',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  scheduleTime: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  scheduleEvent: {
    flex: 1,
  },
  sponsorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sponsorItem: {
    fontSize: 14,
    marginRight: 10,
    marginBottom: 5,
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  venueAddress: {
    fontSize: 16,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HackathonDetailsScreen;