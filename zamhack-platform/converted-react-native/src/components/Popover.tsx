import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated, Easing, Platform, UIManager,  } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  buttonLabel?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  arrowSize?: number;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  buttonLabel = 'Open Popover',
  placement = 'bottom',
  offset = 10,
  arrowSize = 10,
  backgroundColor = 'white',
  textColor = 'black',
  borderRadius = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [arrowPosition, setArrowPosition] = useState({ left: 0, top: 0 });
  const [buttonWidth, setButtonWidth] = useState(0);
  const [buttonHeight, setButtonHeight] = useState(0);
  const buttonRef = useRef<TouchableOpacity>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { bottom, top, left, right } = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const calculatePosition = () => {
    if (!buttonRef.current) return;

    buttonRef.current.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setButtonWidth(width);
        setButtonHeight(height);

        let popoverX: number, popoverY: number, arrowLeft: number, arrowTop: number;

        switch (placement) {
          case 'top':
            popoverX = x + width / 2;
            popoverY = y - offset;
            arrowLeft = width / 2;
            arrowTop = height - arrowSize;
            break;
          case 'bottom':
            popoverX = x + width / 2;
            popoverY = y + height + offset;
            arrowLeft = width / 2;
            arrowTop = 0;
            break;
          case 'left':
            popoverX = x - offset;
            popoverY = y + height / 2;
            arrowLeft = width - arrowSize;
            arrowTop = height / 2;
            break;
          case 'right':
            popoverX = x + width + offset;
            popoverY = y + height / 2;
            arrowLeft = 0;
            arrowTop = height / 2;
            break;
          default: // bottom
            popoverX = x + width / 2;
            popoverY = y + height + offset;
            arrowLeft = width / 2;
            arrowTop = 0;
            break;
        }

        setPopoverPosition({ x: popoverX, y: popoverY });
        setArrowPosition({ left: arrowLeft, top: arrowTop });
      }
    );
  };

  const togglePopover = () => {
    if (!isVisible) {
      calculatePosition();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.easeIn,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.easeOut,
        useNativeDriver: true,
      }).start();
    }
    setIsVisible(!isVisible);
  };

  const getPopoverStyle = () => {
    const style: any = {
      backgroundColor: backgroundColor,
      borderRadius: borderRadius,
      position: 'absolute',
      zIndex: 10,
      opacity: fadeAnim,
    };

    switch (placement) {
      case 'top':
        style.bottom =
          (popoverPosition.y) - bottom; // Adjust for safe area
        style.left = popoverPosition.x - buttonWidth / 2;
        break;
      case 'bottom':
        style.top = popoverPosition.y + top; // Adjust for safe area
        style.left = popoverPosition.x - buttonWidth / 2;
        break;
      case 'left':
        style.top = popoverPosition.y - buttonHeight / 2 + top;
        style.right = (popoverPosition.x) - right;
        break;
      case 'right':
        style.top = popoverPosition.y - buttonHeight / 2 + top;
        style.left = popoverPosition.x + left;
        break;
      default:
        style.top = popoverPosition.y + top;
        style.left = popoverPosition.x - buttonWidth / 2;
        break;
    }

    return style;
  };

  const getArrowStyle = () => {
    const style: any = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderLeftWidth: arrowSize,
      borderRightWidth: arrowSize,
      borderBottomWidth: arrowSize,
      borderTopWidth: arrowSize,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      zIndex: 11,
    };

    switch (placement) {
      case 'top':
        style.borderBottomColor = backgroundColor;
        style.bottom = -arrowSize;
        style.left = arrowPosition.left - arrowSize;
        break;
      case 'bottom':
        style.borderTopColor = backgroundColor;
        style.top = -arrowSize;
        style.left = arrowPosition.left - arrowSize;
        break;
      case 'left':
        style.borderRightColor = backgroundColor;
        style.right = -arrowSize;
        style.top = arrowPosition.top - arrowSize;
        break;
      case 'right':
        style.borderLeftColor = backgroundColor;
        style.left = -arrowSize;
        style.top = arrowPosition.top - arrowSize;
        break;
      default:
        style.borderTopColor = backgroundColor;
        style.top = -arrowSize;
        style.left = arrowPosition.left - arrowSize;
        break;
    }

    return style;
  };

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        onPress={togglePopover}
        style={styles.button}
      >
        {children ? (
          children
        ) : (
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={togglePopover}
      >
        <TouchableWithoutFeedback onPress={togglePopover}>
          <View style={styles.modalOverlay}>
            <Animated.View style={getPopoverStyle()}>
              <Animated.View style={getArrowStyle()} />
              <View style={styles.contentContainer}>
                {typeof content === 'string' ? (
                  <Text style={[styles.contentText, { color: textColor }]}>
                    {content}
                  </Text>
                ) : (
                  content
                )}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 15,
  },
  contentText: {
    fontSize: 16,
  },
});

export default Popover;