import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';

interface PlayerCounterProps {
  className?: string;
}

export function PlayerCounter({ className }: PlayerCounterProps) {
  const { gameState, toggleSidebar } = useGameStore();
  const count = gameState?.players.length ?? 0;

  return (
    <button
      onClick={() => toggleSidebar(true)}
      className={cn(
        'glass rounded-xl px-3.5 py-2 flex items-center gap-2 active:scale-95 transition-all',
        className
      )}
    >
      <Users size={15} className="text-white/40" />
      <span className="text-sm text-white/60">{count}</span>
      <span className="text-[10px] text-white/20">●</span>
    </button>
  );
}