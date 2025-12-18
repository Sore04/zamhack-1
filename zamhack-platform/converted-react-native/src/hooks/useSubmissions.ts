import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Submission {
  id: string;
  data: any; // Replace 'any' with a more specific type if possible
  timestamp: number;
}

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SUBMISSIONS_STORAGE_KEY = 'submissions';

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const storedSubmissions = await AsyncStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        if (storedSubmissions) {
          setSubmissions(JSON.parse(storedSubmissions));
        }
      } catch (e) {
        setError('Failed to load submissions.');
        Alert.alert('Error', 'Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const addSubmission = async (submissionData: any) => {
    const newSubmission: Submission = {
      id: String(Date.now()), // Simple ID generation
      data: submissionData,
      timestamp: Date.now(),
    };

    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);

    try {
      await AsyncStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updatedSubmissions));
    } catch (e) {
      setError('Failed to save submission.');
      Alert.alert('Error', 'Failed to save submission.');
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    const updatedSubmissions = submissions.filter((submission) => submission.id !== submissionId);
    setSubmissions(updatedSubmissions);

    try {
      await AsyncStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updatedSubmissions));
    } catch (e) {
      setError('Failed to delete submission.');
      Alert.alert('Error', 'Failed to delete submission.');
    }
  };

  const updateSubmission = async (submissionId: string, updatedData: any) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission.id === submissionId ? { ...submission, data: updatedData } : submission
    );
    setSubmissions(updatedSubmissions);

    try {
      await AsyncStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updatedSubmissions));
    } catch (e) {
      setError('Failed to update submission.');
      Alert.alert('Error', 'Failed to update submission.');
    }
  };

  return {
    submissions,
    loading,
    error,
    addSubmission,
    deleteSubmission,
    updateSubmission,
  };
};