import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

interface HeaderProps {
  title: string;
  onPress?: () => void; // Optional onPress handler for a button/action
  showBackButton?: boolean; // Optional prop to show a back button
  onBackPress?: () => void; // Optional back button press handler
  backgroundColor?: string; // Optional background color
  titleColor?: string; // Optional title color
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onPress,
  showBackButton = false,
  onBackPress,
  backgroundColor = '#fff',
  titleColor = '#000',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      { backgroundColor: backgroundColor }
    ]}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Action</Text>
        </TouchableOpacity>
      )}
      <StatusBar backgroundColor={backgroundColor} barStyle={titleColor === '#000' ? 'dark-content' : 'light-content'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;