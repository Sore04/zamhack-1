import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform, Vibration,  } from 'react-native';

interface DialogProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onConfirm?: () => void; // Optional confirm action
  confirmText?: string; // Optional confirm button text
  cancelText?: string; // Optional cancel button text
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10); //Haptic feedback on iOS
    }
    setIsModalVisible(false);
    onClose();
  };

  const handleConfirm = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10); //Haptic feedback on iOS
    }
    if (onConfirm) {
      onConfirm();
    }
    setIsModalVisible(false);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalText}>{content}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={handleClose}
              >
                <Text style={styles.textStyle}>{cancelText}</Text>
              </TouchableOpacity>
              {onConfirm && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonConfirm]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.textStyle}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Adjust width as needed
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 2,
    marginHorizontal: 5,
  },
  buttonConfirm: {
    backgroundColor: '#2196F3',
  },
  buttonCancel: {
    backgroundColor: '#ddd',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Dialog;