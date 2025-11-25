import React from 'react';
import { SidebarProvider } from '@/src/contexts/SidebarContext';
import { AppSettingsProvider } from '@/src/provider/AppSettingsProvider';
import { AuthModalProvider } from './AuthModalProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSettingsProvider>
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </AppSettingsProvider>
    </SidebarProvider>
  );
};
