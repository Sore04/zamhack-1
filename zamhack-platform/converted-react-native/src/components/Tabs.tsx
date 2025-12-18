import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { HapticFeedbackTypes, triggerHapticFeedback } from 'react-native-haptic-feedback';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  initialTabIndex?: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialTabIndex = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTabIndex);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    triggerHapticFeedback(HapticFeedbackTypes.impactLight);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              activeTab === index ? styles.activeTabItem : styles.inactiveTabItem,
            ]}
            onPress={() => handleTabPress(index)}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === index ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tabContent}>
        {tabs[activeTab].content}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#007bff',
  },
  inactiveTabItem: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#fff',
  },
  inactiveTabLabel: {
    color: '#333',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
});

export default Tabs;