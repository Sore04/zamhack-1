// Converted React Native components file
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CheckboxProps {
  checked: boolean;
  onChange: (newValue: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, disabled }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.vibrate();
      }
    }
  };

  const checkboxStyle = [
    styles.checkboxBase,
    checked && styles.checkboxChecked,
    disabled && styles.checkboxDisabled,
    isPressed && styles.checkboxPressed,
  ];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <View style={checkboxStyle}>
        {checked && <Feather name="check" size={16} color="white" />}
      </View>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#A0AEC0',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#3182CE',
    borderColor: '#3182CE',
  },
  checkboxDisabled: {
    backgroundColor: '#EDF2F7',
    borderColor: '#A0AEC0',
  },
  checkboxPressed: {
    opacity: 0.8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2D3748',
  },
  labelDisabled: {
    color: '#A0AEC0',
  },
});

export default Checkbox;