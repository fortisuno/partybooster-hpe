import * as React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';
import { SidebarPlayers } from '@/components/organisms/SidebarPlayers';
import { ToastProvider } from '@/components/ui/useToast';
import { Toaster } from '@/components/ui/Toaster';

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RootLayout({ children, className }: RootLayoutProps) {
  const { currentScreen } = useGameStore();

  return (
    <ToastProvider>
      <div className="h-screen bg-radial flex flex-col overflow-hidden">
        <div className="h-screen max-w-mobile mx-auto relative w-full flex flex-col overflow-hidden">
          <main className={cn('flex-1 pb-6 px-5', className)}>
            {children}
          </main>
          {currentScreen === 'game-arena' && <SidebarPlayers />}
        </div>
        <Toaster />
      </div>
    </ToastProvider>
  );
}