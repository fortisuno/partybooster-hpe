import { AnimatePresence, motion } from 'framer-motion';
import type { Player, House } from '@/types';
import { HouseShield } from '@/components/atoms/HouseShield';
import { Crown } from 'lucide-react';

interface LobbyPlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
  className?: string;
}

const playerVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
};

export function LobbyPlayerList({ players, currentPlayerId, className }: LobbyPlayerListProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <AnimatePresence mode="popLayout">
        {players.map((player) => (
          <motion.div
            key={player.id}
            variants={playerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3"
          >
            <HouseShield house={player.house as House} size={32} active={player.id === currentPlayerId} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/90 truncate">{player.name}</span>
                {player.isHost && (
                  <span className="text-amber-400/70">
                    <Crown size={14} />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-white/30">{player.house}</span>
            </div>
            {player.id === currentPlayerId && (
              <span className="text-[10px] text-white/20 uppercase tracking-wider font-body">Tú</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}