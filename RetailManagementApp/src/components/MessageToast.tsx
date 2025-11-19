import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMessage } from '../contexts/MessageContext';

const MessageToast: React.FC = () => {
  const { message, hideMessage } = useMessage();

  if (!message) return null;

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        {message.title && <Text style={styles.title}>{message.title}</Text>}
        <Text style={styles.text}>{message.text}</Text>
      </View>
      <TouchableOpacity onPress={hideMessage} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MessageToast;
