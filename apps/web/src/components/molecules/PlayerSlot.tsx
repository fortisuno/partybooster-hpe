import { Badge } from '@/components/ui/Badge';
import { HouseBadge } from '@/components/atoms/HouseBadge';
import { TurnRing } from '@/components/atoms/TurnRing';
import { User } from 'lucide-react';
import type { Player } from '@/types';

interface PlayerSlotProps {
  player: Player;
  isCurrentPlayer?: boolean;
  isActiveTurn?: boolean;
  className?: string;
}

export function PlayerSlot({ player, isCurrentPlayer = false, isActiveTurn = false, className }: PlayerSlotProps) {
  return (
    <TurnRing isActive={isActiveTurn} house={player.house} className={className}>
      <div className="flex items-center gap-3 p-3 bg-zinc-900/80 backdrop-blur rounded-xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          {player.offline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-zinc-900" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-100 truncate">
              {player.name}
            </span>
            {player.isHost && (
              <Badge variant="host" className="text-[10px]">ANFITRIÓN</Badge>
            )}
            {player.offline && (
              <Badge variant="offline" className="text-[10px]">DESCONECTADO</Badge>
            )}
          </div>
          <HouseBadge house={player.house} className="mt-1" />
        </div>
        {isCurrentPlayer && !isActiveTurn && (
          <span className="text-xs text-amber-400 font-medium">Tu turno</span>
        )}
      </div>
    </TurnRing>
  );
}