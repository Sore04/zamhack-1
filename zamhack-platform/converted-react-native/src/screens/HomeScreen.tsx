import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, TextInput, RefreshControl, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { HapticFeedbackTypes, triggerHapticFeedback } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import assets
import logo from '../../assets/images/logo.png'; // Example logo import

interface Hackathon {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  imageUrl?: string;
  isOngoing?: boolean;
}

const dummyHackathons: Hackathon[] = [
  {
    id: '1',
    name: 'Global AI Hackathon',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    location: 'Online',
    description: 'A global hackathon focused on AI and machine learning.',
    imageUrl: 'https://via.placeholder.com/150',
    isOngoing: false,
  },
  {
    id: '2',
    name: 'Sustainable Solutions Hack',
    startDate: '2024-04-01',
    endDate: '2024-04-03',
    location: 'New York, NY',
    description: 'Develop innovative solutions for sustainability challenges.',
    imageUrl: 'https://via.placeholder.com/150',
    isOngoing: true,
  },
  {
    id: '3',
    name: 'Web3 Hackathon',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    location: 'San Francisco, CA',
    description: 'Build the future of the decentralized web.',
    imageUrl: 'https://via.placeholder.com/150',
    isOngoing: false,
  },
  {
    id: '4',
    name: 'Mobile App Innovation Challenge',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    location: 'London, UK',
    description: 'Create innovative mobile applications to solve real-world problems.',
    imageUrl: 'https://via.placeholder.com/150',
    isOngoing: true,
  },
  {
    id: '5',
    name: 'Data Science Hackathon',
    startDate: '2024-04-15',
    endDate: '2024-04-17',
    location: 'Berlin, Germany',
    description: 'Dive into the world of data science and analytics.',
    imageUrl: 'https://via.placeholder.com/150',
    isOngoing: false,
  },
];


interface HomeScreenProps {}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'Home'>['navigation']>();
  const [hackathons, setHackathons] = useState<Hackathon[]>(dummyHackathons);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationListener = React.useRef<Notifications.Subscription>();
  const responseListener = React.useRef<Notifications.Subscription>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(true);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching data
    setTimeout(() => {
      setHackathons(dummyHackathons); // Reset to original data
      setRefreshing(false);
      triggerHapticFeedback(HapticFeedbackTypes.ImpactLight);
    }, 1000);
  }, []);

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHackathonPress = (hackathon: Hackathon) => {
    navigation.navigate('Details', { hackathonId: hackathon.id });
  };

  const renderItem = ({ item }: { item: Hackathon }) => (
    <TouchableOpacity style={styles.hackathonItem} onPress={() => handleHackathonPress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.hackathonImage} />
      <View style={styles.hackathonDetails}>
        <Text style={styles.hackathonName}>{item.name}</Text>
        <Text style={styles.hackathonLocation}>{item.location}</Text>
        <Text style={styles.hackathonDate}>{item.startDate} - {item.endDate}</Text>
      </View>
    </TouchableOpacity>
  );

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Hackathon! 🚀",
        body: 'A new hackathon is starting soon. Check it out!',
        data: { data: 'goes here' },
      },
      trigger: { seconds: 5 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.headerTitle}>Hackathon Finder</Text>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="Search hackathons..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {location && (
          <Text style={styles.locationText}>
            Your Location: {location.coords.latitude}, {location.coords.longitude}
          </Text>
        )}

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={async () => {
            await schedulePushNotification();
          }}
        >
          <Text style={styles.notificationButtonText}>Schedule Notification</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={filteredHackathons}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>No hackathons found.</Text>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hackathonItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hackathonImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  hackathonDetails: {
    flex: 1,
  },
  hackathonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  hackathonLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  hackathonDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  locationText: {
    fontSize: 14,
    color: 'green',
    textAlign: 'center',
    marginVertical: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginVertical: 5,
  },
  notificationButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  notificationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;