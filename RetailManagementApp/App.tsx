import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { MessageProvider } from './src/contexts/MessageContext';
import AppNavigator from './src/navigation/AppNavigator';
import MessageToast from './src/components/MessageToast';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      <MessageProvider>
        <AuthProvider>
          <AppNavigator />
          <MessageToast />
        </AuthProvider>
      </MessageProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
