import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, TextInput, ActivityIndicator, Platform,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import assets (if needed)
// import { images } from '../../assets';
// import logo from '../../assets/images/logo.png'; // Example image import

interface SubmissionScreenProps {}

export const SubmissionScreen: React.FC<SubmissionScreenProps> = () => {
  const navigation = useNavigation<RootStackScreenProps<'Submission'>['navigation']>();
  const insets = useSafeAreaInsets();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectMedia, setProjectMedia] = useState<string | null>(null); // Store the URI of the selected image
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProjectMedia(result.assets[0].uri);
    }
  };

  const startSpeaking = () => {
    Speech.speak(projectDescription, { language: 'en' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Simulate submission process (replace with actual API call)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network request

      // Simulate success
      Alert.alert('Success', 'Your project has been submitted!');
      navigation.goBack(); // Navigate back or to a confirmation screen

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmissionError('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust as needed
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Submit Your Project</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter project description"
              multiline
              numberOfLines={4}
              value={projectDescription}
              onChangeText={setProjectDescription}
            />
            <TouchableOpacity style={styles.voiceButton} onPress={startSpeaking}>
              <Text style={styles.voiceButtonText}>Read Description</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Media</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload Media</Text>
            </TouchableOpacity>
            {projectMedia && (
              <Image source={{ uri: projectMedia }} style={styles.mediaPreview} />
            )}
          </View>

          {submissionError && (
            <Text style={styles.errorText}>{submissionError}</Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Project</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    textAlignVertical: 'top', // For Android
    height: 100,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  voiceButton: {
    backgroundColor: '#8e44ad',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SubmissionScreen;