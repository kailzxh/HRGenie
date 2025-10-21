'use client';

import React from 'react';
// Assuming the path to your individual provider files is correct
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Assuming the path to your Notifications component is correct
import { Notifications } from '@/components/ui/notifications'; 

/**
 * Combines all client-side context providers and components into a single wrapper.
 * This component acts as the client component boundary and provides necessary 
 * contexts (Theme, Auth) to the rest of the application.
 */
export default function Providers({ children }) {
  return (
    // ThemeProvider is typically the outermost context
    <ThemeProvider>
      {/* AuthProvider wraps the content that needs authentication status */}
      <AuthProvider>
        {children}
        {/* The Notifications component should be mounted high up in the tree */}
        <Notifications /> 
      </AuthProvider>
    </ThemeProvider>
  );
}
