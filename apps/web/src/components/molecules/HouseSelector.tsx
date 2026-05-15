import { motion } from 'framer-motion';
import type { House } from '@/types';
import { HouseShield, HOUSE_META_MAP } from '@/components/atoms/HouseShield';
import { cn } from '@/lib/utils';

interface HouseSelectorProps {
  selectedHouse: House;
  onSelect: (house: House) => void;
  className?: string;
}

const HOUSES: House[] = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];

export function HouseSelector({ selectedHouse, onSelect, className }: HouseSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {HOUSES.map((house) => {
        const meta = HOUSE_META_MAP[house];
        const isSelected = selectedHouse === house;

        return (
          <motion.button
            key={house}
            onClick={() => onSelect(house)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200',
              isSelected
                ? 'border-transparent'
                : 'glass border border-transparent hover:border-white/10'
            )}
            style={
              isSelected
                ? {
                    background: `linear-gradient(135deg, ${meta.primary}22, ${meta.accent}11)`,
                    boxShadow: `0 0 0 1.5px ${meta.accent}44, 0 0 20px ${meta.accent}15`,
                  }
                : {}
            }
          >
            <HouseShield house={house} size={40} active={isSelected} />
            <span
              className="text-xs font-medium font-body"
              style={{ color: isSelected ? (house === 'Hufflepuff' ? '#FFFFFF' : meta.accent) : 'rgba(255,255,255,0.4)' }}
            >
              {meta.label}
            </span>
            {isSelected && (
              <div
                className="absolute -inset-0.5 rounded-2xl -z-10 opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${meta.accent}, ${meta.primary}, ${meta.accent})`,
                  backgroundSize: '200% 200%',
                  animation: 'house-aura 3s ease-in-out infinite',
                  filter: 'blur(8px)',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}