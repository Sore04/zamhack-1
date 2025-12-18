import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  // Add other properties as needed
}

export const useHackathons = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const HACKATHONS_STORAGE_KEY = 'hackathons';

  useEffect(() => {
    const loadHackathons = async () => {
      setLoading(true);
      try {
        const storedHackathons = await AsyncStorage.getItem(HACKATHONS_STORAGE_KEY);
        if (storedHackathons) {
          setHackathons(JSON.parse(storedHackathons));
        } else {
          // If no data is stored, initialize with an empty array
          setHackathons([]);
        }
      } catch (e) {
        setError('Failed to load hackathons.');
        Alert.alert('Error', 'Failed to load hackathons.');
        console.error('Error loading hackathons:', e);
      } finally {
        setLoading(false);
      }
    };

    loadHackathons();
  }, []);

  const saveHackathons = async (newHackathons: Hackathon[]) => {
    try {
      await AsyncStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(newHackathons));
      setHackathons(newHackathons); // Update state immediately for UI refresh
    } catch (e) {
      setError('Failed to save hackathons.');
      Alert.alert('Error', 'Failed to save hackathons.');
      console.error('Error saving hackathons:', e);
    }
  };

  const addHackathon = async (hackathon: Hackathon) => {
    try {
      const newHackathons = [...hackathons, hackathon];
      await saveHackathons(newHackathons);
    } catch (e) {
      setError('Failed to add hackathon.');
      Alert.alert('Error', 'Failed to add hackathon.');
      console.error('Error adding hackathon:', e);
    }
  };

  const updateHackathon = async (updatedHackathon: Hackathon) => {
    try {
      const newHackathons = hackathons.map(h =>
        h.id === updatedHackathon.id ? updatedHackathon : h
      );
      await saveHackathons(newHackathons);
    } catch (e) {
      setError('Failed to update hackathon.');
      Alert.alert('Error', 'Failed to update hackathon.');
      console.error('Error updating hackathon:', e);
    }
  };

  const deleteHackathon = async (id: string) => {
    try {
      const newHackathons = hackathons.filter(h => h.id !== id);
      await saveHackathons(newHackathons);
    } catch (e) {
      setError('Failed to delete hackathon.');
      Alert.alert('Error', 'Failed to delete hackathon.');
      console.error('Error deleting hackathon:', e);
    }
  };

  return {
    hackathons,
    loading,
    error,
    addHackathon,
    updateHackathon,
    deleteHackathon,
  };
};