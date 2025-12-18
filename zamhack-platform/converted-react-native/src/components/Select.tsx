import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView, Platform, UIManager, LayoutAnimation,  } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or any other icon library
import { HapticFeedbackTypes, triggerHapticFeedback } from 'react-native-propel-kit';

interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: any; // Allow custom styles
}

const DEFAULT_PLACEHOLDER = 'Select an option';

export const Select = <T extends Record<string, any>>({
  options,
  value,
  onChange,
  labelKey,
  valueKey,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  error,
  style,
}: SelectProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const toggleModal = () => {
    if (!disabled) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setModalVisible(!modalVisible);
      triggerHapticFeedback(HapticFeedbackTypes.impactLight);
    }
  };

  const handleSelect = (item: T) => {
    onChange(item);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModalVisible(false);
    triggerHapticFeedback(HapticFeedbackTypes.selection);
  };

  const renderItem = ({ item }: { item: T }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item)}
      disabled={disabled}
    >
      <Text style={styles.optionText}>{String(item[labelKey])}</Text>
    </TouchableOpacity>
  );

  const selectedLabel = value ? String(value[labelKey]) : placeholder;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          disabled ? styles.disabledButton : null,
          error ? styles.errorButton : null,
        ]}
        onPress={toggleModal}
        disabled={disabled}
        ref={selectRef}
        accessible={true}
        accessibilityLabel="Select an option"
        accessibilityHint="Opens a list of options to choose from"
      >
        <Text
          style={[
            styles.selectedText,
            value ? null : styles.placeholderText,
            disabled ? styles.disabledText : null,
            error ? styles.errorText : null,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedLabel}
        </Text>
        <Ionicons
          name={modalVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? '#ccc' : '#333'}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => String(item[valueKey])}
              ListEmptyComponent={<Text style={styles.emptyListText}>No options available.</Text>}
            />
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  disabledButton: {
    backgroundColor: '#eee',
    borderColor: '#ddd',
  },
  errorButton: {
    borderColor: 'red',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#888',
  },
  disabledText: {
    color: '#ccc',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#777',
    padding: 10,
  },
});

export default Select;