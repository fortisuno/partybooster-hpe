import { Badge } from '@/components/ui/Badge';
import type { House } from '@/types';

interface HouseBadgeProps {
  house: House;
  className?: string;
}

const houseLabels: Record<House, string> = {
  Gryffindor: 'Gryffindor',
  Hufflepuff: 'Hufflepuff',
  Ravenclaw: 'Ravenclaw',
  Slytherin: 'Slytherin',
};

const variantMap: Record<House, 'gryffindor' | 'hufflepuff' | 'ravenclaw' | 'slytherin'> = {
  Gryffindor: 'gryffindor',
  Hufflepuff: 'hufflepuff',
  Ravenclaw: 'ravenclaw',
  Slytherin: 'slytherin',
};

export function HouseBadge({ house, className }: HouseBadgeProps) {
  return (
    <Badge variant={variantMap[house]} className={className}>
      {houseLabels[house]}
    </Badge>
  );
}