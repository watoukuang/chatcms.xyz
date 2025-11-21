import React from 'react';
import { SidebarProvider } from '@/src/contexts/SidebarContext';
import { AppSettingsProvider } from '@/src/provider/AppSettingsProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSettingsProvider>
        {children}
      </AppSettingsProvider>
    </SidebarProvider>
  );
};
