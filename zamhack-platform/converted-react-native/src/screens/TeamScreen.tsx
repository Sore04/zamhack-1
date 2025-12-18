import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, TextInput, RefreshControl, FlatList, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, HapticFeedback,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Import assets (if needed)
// import logo from '../../assets/images/logo.png';

interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array of user IDs
  // Add other team properties as needed
}

interface TeamScreenProps {}

export const TeamScreen: React.FC<TeamScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'Team'>['navigation']>();
  const insets = useSafeAreaInsets();

  // State variables
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Dummy user ID (replace with actual user authentication)
  const currentUserId = 'user123';

  // Simulate fetching teams from an API
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dummy team data
      const dummyTeams: Team[] = [
        {
          id: 'team1',
          name: 'Awesome Team',
          description: 'A team of awesome people',
          members: ['user123', 'user456'],
        },
        {
          id: 'team2',
          name: 'Fantastic Four',
          description: 'Four fantastic individuals',
          members: ['user789', 'user123'],
        },
      ];

      setTeams(dummyTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams().finally(() => setRefreshing(false));
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Team name cannot be empty.');
      return;
    }

    setIsCreatingTeam(true);
    try {
      // Simulate API call to create team
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new team object
      const newTeam: Team = {
        id: `team${Date.now()}`, // Generate a unique ID
        name: newTeamName,
        description: newTeamDescription,
        members: [currentUserId], // Add the current user as a member
      };

      // Update the teams state with the new team
      setTeams((prevTeams) => [...prevTeams, newTeam]);

      // Reset the input fields
      setNewTeamName('');
      setNewTeamDescription('');

      // Provide feedback to the user
      Alert.alert('Success', 'Team created successfully!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Optionally navigate to the new team's chat screen
      // navigation.navigate('Chat', { teamId: newTeam.id });
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleJoinTeam = (teamId: string) => {
    // Simulate joining a team
    Alert.alert(
      'Join Team',
      `Are you sure you want to join team ${teamId}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: () => {
            // Simulate API call to join team
            // Update the team's members list
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Success', `Joined team ${teamId}!`);
          },
        },
      ]
    );
  };

  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => {
        navigation.navigate('Chat', { teamId: item.id, teamName: item.name });
        Haptics.selectionAsync();
      }}
    >
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.teamDescription}>{item.description}</Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinTeam(item.id)}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} // Adjust as needed
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Teams</Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {loading ? (
                <Text style={styles.loadingText}>Loading teams...</Text>
              ) : (
                <>
                  {teams.length > 0 ? (
                    <FlatList
                      data={teams}
                      renderItem={renderTeamItem}
                      keyExtractor={(item) => item.id}
                      style={styles.teamList}
                    />
                  ) : (
                    <Text style={styles.noTeamsText}>No teams available.</Text>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.createTeamSection}>
              <Text style={styles.createTeamTitle}>Create a New Team</Text>
              <TextInput
                style={styles.input}
                placeholder="Team Name"
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Team Description"
                value={newTeamDescription}
                onChangeText={setNewTeamDescription}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTeam}
                disabled={isCreatingTeam}
              >
                <Text style={styles.createButtonText}>
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  noTeamsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  teamList: {
    flex: 1,
  },
  teamItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  createTeamSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createTeamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TeamScreen;