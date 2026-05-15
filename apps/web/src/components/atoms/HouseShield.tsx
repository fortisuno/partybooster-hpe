import type { House } from '@/types';

interface HouseShieldProps {
  house: House;
  size?: number;
  active?: boolean;
  className?: string;
}

const HOUSE_META: Record<House, { primary: string; accent: string; letter: string; label: string }> = {
  Gryffindor: { primary: '#7A1C1C', accent: '#D4A843', letter: 'G', label: 'Gryffindor' },
  Hufflepuff: { primary: '#D4A843', accent: '#372E29', letter: 'H', label: 'Hufflepuff' },
  Ravenclaw: { primary: '#1A2B5E', accent: '#946B2D', letter: 'R', label: 'Ravenclaw' },
  Slytherin: { primary: '#1A472A', accent: '#C0C0C0', letter: 'S', label: 'Slytherin' },
};

export function HouseShield({ house, size = 48, active = false, className }: HouseShieldProps) {
  const meta = HOUSE_META[house];
  if (!meta) return null;

  const s = size;
  const cx = s / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      aria-label={meta.label}
      className={className}
    >
      <path
        d={`M${cx} ${s * 0.08} L${s * 0.15} ${s * 0.25} V${s * 0.55} Q${s * 0.15} ${s * 0.75} ${cx} ${s * 0.92} Q${s * 0.85} ${s * 0.75} ${s * 0.85} ${s * 0.55} V${s * 0.25} Z`}
        fill={meta.primary}
        stroke={active ? meta.accent : 'rgba(255,255,255,0.15)'}
        strokeWidth={1.5}
        style={active ? { filter: `drop-shadow(0 0 ${s * 0.12}px ${meta.accent}66)` } : {}}
      />
      <text
        x={cx}
        y={cx + s * 0.12}
        textAnchor="middle"
        fill={meta.accent}
        fontSize={s * 0.35}
        fontWeight="700"
        fontFamily="Cinzel, Georgia, serif"
      >
        {meta.letter}
      </text>
    </svg>
  );
}

export const HOUSE_META_MAP = HOUSE_META;