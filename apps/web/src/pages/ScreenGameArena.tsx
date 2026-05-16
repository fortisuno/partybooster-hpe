import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { MagicCard } from '@/components/atoms/MagicCard';
import { CardSkeleton } from '@/components/atoms/CardSkeleton';
import { HouseShield } from '@/components/atoms/HouseShield';
import { PlayerCounter } from '@/components/molecules/PlayerCounter';
import { FinishTurnButton } from '@/components/organisms/FinishTurnButton';

export function ScreenGameArena() {
  const { gameState, playerId, lastDrawnCard, isCardTransitioning } = useGameStore();

  if (!gameState) return null;

  const currentPlayerId = gameState.currentPlayerId;
  const isMyTurn = currentPlayerId === playerId;
  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);

  const screenVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        key="game-arena"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-full overflow-hidden pt-16"
      >
        <div className="flex justify-end mb-6">
          <PlayerCounter />
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-medium font-body mb-1.5">
            Turno Actual
          </p>
          <div className="flex items-center justify-center gap-2.5">
            {currentPlayer && (
              <HouseShield
                house={currentPlayer.house as any}
                size={24}
                active
              />
            )}
            <span className="font-display text-lg text-white/80">
              {currentPlayer?.name ?? 'Desconocido'}
            </span>
          </div>
          <div className="w-16 h-[2px] mx-auto mt-2 rounded-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center -mt-4">
          <AnimatePresence mode="wait">
            {isCardTransitioning ? (
              <motion.div
                key="card-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <CardSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key={lastDrawnCard?.name ?? 'empty'}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6"
              >
                <MagicCard card={lastDrawnCard} />
              </motion.div>
            )}
          </AnimatePresence>

          {isMyTurn && <FinishTurnButton />}

          {!isMyTurn && currentPlayerId && (
            <div className="text-center mt-4">
              <p className="text-xs text-white/30 font-body">
                Esperando el movimiento de {currentPlayer?.name}…
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
