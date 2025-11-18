import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Message {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

interface MessageContextType {
  message: Message | null;
  showMessage: (text: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
  showSuccess: (text: string, title?: string) => void;
  showError: (text: string, title?: string) => void;
  showWarning: (text: string, title?: string) => void;
  showInfo: (text: string, title?: string) => void;
  hideMessage: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => {
    setMessage({ text, type, title });

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const showSuccess = (text: string, title?: string) => {
    showMessage(text, 'success', title || 'Success');
  };

  const showError = (text: string, title?: string) => {
    showMessage(text, 'error', title || 'Error');
  };

  const showWarning = (text: string, title?: string) => {
    showMessage(text, 'warning', title || 'Warning');
  };

  const showInfo = (text: string, title?: string) => {
    showMessage(text, 'info', title || 'Info');
  };

  const hideMessage = () => {
    setMessage(null);
  };

  const value: MessageContextType = {
    message,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideMessage,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
