import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SwitchProps {
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ isOn, onToggle, label, disabled }) => {
  const [position] = useState(new Animated.Value(isOn ? 1 : 0));

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !isOn;
    Animated.timing(position, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    onToggle(newValue);

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.vibrateAsync();
    }
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 21],
  });

  const backgroundColor = position.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#4CAF50'],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.switchContainer, disabled && styles.disabled]}
        onPress={toggleSwitch}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.switch,
            {
              backgroundColor: backgroundColor,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.knob,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switch: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  knob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Switch;