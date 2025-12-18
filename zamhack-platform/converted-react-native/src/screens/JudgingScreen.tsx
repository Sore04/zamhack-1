import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, TextInput, RefreshControl, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { HapticFeedbackTypes, triggerHapticFeedback } from '../utils/haptics'; // Create this utility
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import assets (if needed)
// import logo from '../../assets/images/logo.png'; // Example

interface Submission {
  id: string;
  title: string;
  description: string;
  // Add other submission properties
}

interface RubricItem {
  id: string;
  label: string;
  maxScore: number;
}

interface JudgingScreenProps {}

const JudgingScreen: React.FC<JudgingScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'Judging'>['navigation']>();
  const insets = useSafeAreaInsets();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rubric, setRubric] = useState<RubricItem[]>([
    { id: '1', label: 'Creativity', maxScore: 10 },
    { id: '2', label: 'Technical Skill', maxScore: 10 },
    { id: '3', label: 'Presentation', maxScore: 10 },
  ]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for submissions (replace with API call)
  const mockSubmissions: Submission[] = [
    { id: '1', title: 'Submission 1', description: 'Description for submission 1' },
    { id: '2', title: 'Submission 2', description: 'Description for submission 2' },
    { id: '3', title: 'Submission 3', description: 'Description for submission 3' },
  ];

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissions(mockSubmissions);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissions().finally(() => setRefreshing(false));
  }, [fetchSubmissions]);

  const handleSubmissionPress = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScores({}); // Reset scores when selecting a new submission
    setComment('');
    triggerHapticFeedback(HapticFeedbackTypes.SELECTION);
  };

  const handleScoreChange = (rubricId: string, score: number) => {
    setScores({ ...scores, [rubricId]: score });
  };

  const handleSubmit = () => {
    if (!selectedSubmission) {
      Alert.alert('Error', 'No submission selected.');
      return;
    }

    // Validate scores
    for (const rubricItem of rubric) {
      if (scores[rubricItem.id] === undefined) {
        Alert.alert('Error', `Please provide a score for ${rubricItem.label}.`);
        return;
      }
    }

    // Simulate submission to backend
    console.log('Submission ID:', selectedSubmission.id);
    console.log('Scores:', scores);
    console.log('Comment:', comment);
    Alert.alert('Success', 'Scores submitted!');
    setSelectedSubmission(null); // Clear selected submission after submission
    triggerHapticFeedback(HapticFeedbackTypes.SUCCESS);
  };

  const renderSubmissionItem = (submission: Submission) => (
    <TouchableOpacity
      key={submission.id}
      style={styles.submissionItem}
      onPress={() => handleSubmissionPress(submission)}
    >
      <Text style={styles.submissionTitle}>{submission.title}</Text>
      <Text style={styles.submissionDescription}>{submission.description}</Text>
    </TouchableOpacity>
  );

  const renderRubricItem = (item: RubricItem) => (
    <View key={item.id} style={styles.rubricItem}>
      <Text style={styles.rubricLabel}>{item.label}</Text>
      <View style={styles.scoreContainer}>
        {[...Array(item.maxScore + 1)].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.scoreButton,
              scores[item.id] === index && styles.scoreButtonSelected,
            ]}
            onPress={() => handleScoreChange(item.id, index)}
          >
            <Text style={[
              styles.scoreText,
              scores[item.id] === index && styles.scoreTextSelected,
            ]}>{index}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} // Adjust as needed
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Judging Panel</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text>Loading Submissions...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchSubmissions}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : selectedSubmission ? (
            <View style={styles.judgingContainer}>
              <Text style={styles.submissionTitle}>
                {selectedSubmission.title}
              </Text>
              <Text style={styles.submissionDescription}>
                {selectedSubmission.description}
              </Text>

              <View style={styles.rubricContainer}>
                <Text style={styles.rubricTitle}>Rubric</Text>
                {rubric.map(renderRubricItem)}
              </View>

              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Comments:</Text>
                <TextInput
                  style={styles.commentInput}
                  multiline
                  placeholder="Enter your feedback here"
                  value={comment}
                  onChangeText={setComment}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit Scores</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.submissionListContainer}>
              <Text style={styles.submissionListTitle}>Available Submissions</Text>
              {submissions.length > 0 ? (
                submissions.map(renderSubmissionItem)
              ) : (
                <Text>No submissions available.</Text>
              )}
            </View>
          )}
        </ScrollView>
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
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submissionListContainer: {
    paddingHorizontal: 20,
  },
  submissionListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  submissionItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  submissionDescription: {
    fontSize: 14,
    color: '#555',
  },
  judgingContainer: {
    paddingHorizontal: 20,
  },
  rubricContainer: {
    marginTop: 20,
  },
  rubricTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rubricItem: {
    marginBottom: 15,
  },
  rubricLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 5,
    marginBottom: 5,
  },
  scoreButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  scoreText: {
    fontSize: 14,
    color: '#333',
  },
  scoreTextSelected: {
    color: '#fff',
  },
  commentContainer: {
    marginTop: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JudgingScreen;