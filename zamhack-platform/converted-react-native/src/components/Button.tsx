import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useTheme } from './ThemeContext';
import { Theme } from './ThemeContext';
import { HapticFeedbackTypes, triggerHapticFeedback } from './HapticFeedback';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any; // Allow custom styles
  textStyle?: any; // Allow custom text styles
  variant?: 'primary' | 'secondary' | 'tertiary';
  hapticType?: HapticFeedbackTypes;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false, style, textStyle, variant = 'primary', hapticType = 'impactLight' }) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) {
      return theme.buttonDisabledBackground;
    }

    switch (variant) {
      case 'primary':
        return theme.buttonPrimaryBackground;
      case 'secondary':
        return theme.buttonSecondaryBackground;
      case 'tertiary':
        return theme.buttonTertiaryBackground;
      default:
        return theme.buttonPrimaryBackground;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.buttonDisabledText;
    }

    switch (variant) {
      case 'primary':
        return theme.buttonPrimaryText;
      case 'secondary':
        return theme.buttonSecondaryText;
      case 'tertiary':
        return theme.buttonTertiaryText;
      default:
        return theme.buttonPrimaryText;
    }
  };

  const handlePress = () => {
    if (!disabled) {
      triggerHapticFeedback(hapticType);
      onPress();
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText,
        { color: getTextColor() },
        textStyle,
        disabled && styles.disabledText,
      ]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});

export default Button;