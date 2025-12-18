import React from 'react';
import { View, Text, StyleSheet, ProgressBarAndroid, Platform, ProgressViewIOS } from 'react-native';

interface ProgressProps {
  progress: number; // Value between 0 and 1
  color?: string;
  trackColor?: string;
  style?: any; // Allows for custom styling
}

const Progress: React.FC<ProgressProps> = ({ progress, color = '#3498db', trackColor = '#ecf0f1', style }) => {
  const clampedProgress = Math.max(0, Math.min(progress, 1)); // Ensure progress is within 0-1

  if (Platform.OS === 'android') {
    return (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={clampedProgress}
        color={color}
        style={[styles.progressBarAndroid, style]} // Apply custom styles
      />
    );
  } else if (Platform.OS === 'ios') {
    return (
      <ProgressViewIOS
        progress={clampedProgress}
        progressTintColor={color}
        trackTintColor={trackColor}
        style={[styles.progressViewIOS, style]} // Apply custom styles
      />
    );
  } else {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.track, { backgroundColor: trackColor }]}>
          <View style={[styles.bar, { width: `${clampedProgress * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  bar: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressBarAndroid: {
    width: '100%',
  },
  progressViewIOS: {
    width: '100%',
  },
});

export default Progress;