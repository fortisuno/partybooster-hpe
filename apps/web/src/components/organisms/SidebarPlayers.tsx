import { AnimatePresence, motion } from 'framer-motion';
import type { House } from '@/types';
import { HouseShield } from '@/components/atoms/HouseShield';
import { Crown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export function SidebarPlayers() {
  const {
    gameState,
    isHost,
    sidebarOpen,
    toggleSidebar,
    terminateSession,
    leaveRoom,
  } = useGameStore();

  if (!gameState) return null;

  const currentPlayerId = gameState.currentPlayerId;
  const players = gameState.players;

  const handleEndSession = () => {
    terminateSession();
    toggleSidebar(false);
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            Jugadores ({players.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 mt-4">
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'rounded-2xl px-4 py-3 flex items-center gap-3 transition-all',
                  player.id === currentPlayerId
                    ? 'glass-strong border border-white/10'
                    : 'glass'
                )}
              >
                <HouseShield
                  house={player.house as House}
                  size={28}
                  active={player.id === currentPlayerId}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        player.id === currentPlayerId
                          ? 'text-white font-medium'
                          : 'text-white/60'
                      )}
                    >
                      {player.name}
                    </span>
                    {player.id === currentPlayerId && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/20 font-body">{player.house}</span>
                </div>
                {player.isHost && <Crown size={12} className="text-amber-400/50" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/25 uppercase tracking-[0.08em] font-body">
              Código de Invitación
            </span>
            <span className="font-display text-sm tracking-wider text-white/50">
              {gameState.roomCode}
            </span>
          </div>

          {isHost ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  toggleSidebar(false);
                  leaveRoom();
                }}
                className="w-full"
                size="sm"
              >
                Abandonar Sala
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndSession}
                className="w-full"
                size="sm"
              >
                Terminar Sesión
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                toggleSidebar(false);
                leaveRoom();
              }}
              className="w-full"
              size="sm"
            >
              Abandonar Sala
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}