import { motion } from 'framer-motion';
import type { Card } from '@/types';
import { HouseShield, HOUSE_META_MAP } from './HouseShield';

interface MagicCardProps {
  card: Card | null;
  className?: string;
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.85, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -10 },
};

const hoverVariants = {
  rest: { scale: 1, boxShadow: '0 0 0px rgba(212,168,67,0)' },
  hover: { scale: 1.02, boxShadow: '0 0 30px rgba(212,168,67,0.15)' },
};

export function MagicCard({ card, className }: MagicCardProps) {
  if (!card) {
    return (
      <div className="w-full max-w-xs mx-auto text-center">
        <p className="text-white/15 text-sm font-body">Sin carta aún</p>
        <p className="text-white/10 text-xs mt-1 font-body">Roba para comenzar el duelo</p>
      </div>
    );
  }

  const meta = HOUSE_META_MAP[card.house];

  return (
    <motion.div
      key={card.name}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`w-full max-w-xs mx-auto ${className || ''}`}
    >
      <motion.div
        variants={hoverVariants}
        className="w-full rounded-3xl glass-strong border border-white/[0.08] relative overflow-hidden p-6"
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${meta.primary}, ${meta.accent})` }}
        />

        <div className="flex items-center justify-between mb-5 mt-1">
          <HouseShield house={card.house} size={36} active />
          <span
            className="text-[10px] text-white/70 uppercase tracking-[0.12em] font-medium font-body"
            style={{ color: card.house === 'Hufflepuff' ? '#FFFFFF' : `${meta.accent}99` }}
          >
            {meta.label}
          </span>
        </div>

        <h2 className="font-display text-xl font-bold text-white mb-3 leading-snug">
          {card.name}
        </h2>

        <p className="text-sm text-white/70 leading-relaxed mb-5 font-body">
          {card.description}
        </p>

        <div
          className="rounded-2xl px-4 py-3 border border-dashed"
          style={{
            borderColor: `${meta.accent}33`,
            background: `${meta.accent}08`,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1 font-body"
            style={{ color: card.house === 'Hufflepuff' ? '#FFFFFF' : `${meta.accent}AA` }}
          >
            Ventaja de Casa
          </p>
          <p
            className="text-xs leading-relaxed font-body"
            style={{ color: card.house === 'Hufflepuff' ? '#FFFFFF' : `${meta.accent}BB` }}
          >
            {card.houseAdvantage}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}