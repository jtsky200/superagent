'use client';

import React from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          "lg:ml-64" // Always offset by sidebar width on desktop
        )}
      >
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-primary-500">
            <div>
              © 2024 CADILLAC Switzerland. Alle Rechte vorbehalten.
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <a href="#" className="hover:text-primary-700 transition-colors">
                Support
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary-700 transition-colors">
                Dokumentation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

