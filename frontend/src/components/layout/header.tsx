'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore, useNotificationStore, useUiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { toggleSidebar } = useUiStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          ☰
        </Button>
        
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-900 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-primary-900 text-lg hidden sm:block">
            CADILLAC EV CIS
          </span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm" className="relative">
            🔔
            {unreadCount > 0 && (
              <Badge 
                variant="error" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* User menu */}
        {user ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-900 hidden sm:block">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Anmelden
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Registrieren
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

