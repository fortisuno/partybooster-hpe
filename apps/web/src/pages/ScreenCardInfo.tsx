import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { HARRY_POTTER_CARDS } from '@game/shared';
import type { House, Card } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { HouseShield } from '@/components/atoms/HouseShield';

const HOUSES: House[] = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];

const houseLabels: Record<House, string> = {
  Gryffindor: 'Gryffindor',
  Hufflepuff: 'Hufflepuff',
  Ravenclaw: 'Ravenclaw',
  Slytherin: 'Slytherin',
};

function groupCardsByHouse(cards: Card[]): Record<House, Card[]> {
  const grouped: Record<string, Card[]> = {};
  for (const house of HOUSES) {
    grouped[house] = [];
  }
  for (const card of cards) {
    if (grouped[card.house]) {
      grouped[card.house].push(card);
    }
  }
  return grouped as Record<House, Card[]>;
}

export function ScreenCardInfo() {
  const { goBack } = useGameStore();
  const [expandedHouse, setExpandedHouse] = useState<House | null>(null);

  const grouped = groupCardsByHouse(HARRY_POTTER_CARDS);

  const screenVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      key="card-info"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-full overflow-hidden pt-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-white/90">
          Cartas Mágicas
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {HOUSES.map((house) => (
          <div key={house} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedHouse(expandedHouse === house ? null : house)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <HouseShield house={house} size={28} active={false} />
                <span className="text-sm font-medium text-white/90 font-body">
                  {houseLabels[house]}
                </span>
                <span className="text-[11px] text-white/30">
                  {grouped[house].length}
                </span>
              </div>
              <motion.div
                animate={{ rotate: expandedHouse === house ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-white/40" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedHouse === house && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {grouped[house].map((card, idx) => (
                      <div
                        key={`${card.name}-${idx}`}
                        className="bg-white/5 rounded-xl px-3.5 py-3"
                      >
                        <p className="text-sm font-medium text-white/90 mb-1">
                          {card.name}
                        </p>
                        <p className="text-xs text-white/50 leading-relaxed mb-1.5">
                          {card.description}
                        </p>
                        <p className="text-[11px] text-amber-300/60">
                          <span className="text-white/30">Ventaja: </span>
                          {card.houseAdvantage}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
