import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useHaptics } from './useHaptics'; // Create this hook
import { Shadow } from 'react-native-shadow-2';

interface CardProps {
  title: string;
  content: string;
  onPress?: () => void;
  style?: any; // Allow custom styles
}

export const Card: React.FC<CardProps> = ({ title, content, onPress, style }) => {
  const { triggerHaptic } = useHaptics();

  const handlePress = () => {
    if (onPress) {
      triggerHaptic();
      onPress();
    }
  };

  return (
    <Shadow distance={5} offset={[2, 2]} style={[styles.shadowContainer, style]}>
      <Pressable style={styles.cardContainer} onPress={handlePress}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
        </View>
      </Pressable>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    width: '100%',
  },
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden', // Clip content to the border
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#555',
  },
});

// Custom hook for haptic feedback
import { useCallback } from 'react';
import { Vibration } from 'react-native';

export const useHaptics = () => {
  const triggerHaptic = useCallback(() => {
    Vibration.vibrate(10); // Adjust pattern as needed
  }, []);

  return { triggerHaptic };
};

export default Card;