import * as React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-radial flex flex-col">
      <main
        className={cn(
          'flex-1 w-full max-w-mobile mx-auto',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}