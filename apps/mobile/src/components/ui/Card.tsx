import type { ComponentProps } from 'react';
import { View, Text as RNText } from 'react-native';
import type { Card as CardType } from '@game/shared';
import { cn } from '../../lib/cn';

type CardVariant = 'default' | 'drawn' | 'discard';

interface CardProps {
  card: CardType;
  variant?: CardVariant;
}

const houseColors: Record<string, string> = {
  Gryffindor: 'border-gryffindor bg-gryffindor/10',
  Hufflepuff: 'border-hufflepuff bg-hufflepuff/10',
  Ravenclaw: 'border-ravenclaw bg-ravenclaw/10',
  Slytherin: 'border-slytherin bg-slytherin/10',
};

const houseTextColors: Record<string, string> = {
  Gryffindor: 'text-gryffindor-light',
  Hufflepuff: 'text-hufflepuff',
  Ravenclaw: 'text-ravenclaw-light',
  Slytherin: 'text-slytherin-light',
};

export function Card({ card, variant = 'default' }: CardProps) {
  const borderColor = houseColors[card.house] ?? 'border-zinc-600';
  const textColor = houseTextColors[card.house] ?? 'text-zinc-300';

  if (variant === 'discard') {
    return (
      <View className={cn(
        'w-20 h-28 rounded-lg border-2 p-2 bg-zinc-900 opacity-70',
        borderColor
      )}>
        <RNText className={cn('text-xs font-bold mb-1', textColor)} numberOfLines={1}>
          {card.name}
        </RNText>
        <RNText className="text-zinc-400 text-[10px]" numberOfLines={2}>
          {card.description}
        </RNText>
      </View>
    );
  }

  if (variant === 'drawn') {
    return (
      <View className={cn(
        'w-36 h-52 rounded-xl border-2 p-3 bg-zinc-900',
        borderColor
      )}>
        <View className="flex-row justify-between items-start mb-2">
          <RNText className={cn('text-sm font-bold', textColor)} numberOfLines={1}>
            {card.name}
          </RNText>
          {card.isCounter && (
            <View className="bg-gryffindor px-1 rounded">
              <RNText className="text-[8px] font-bold text-white">CONTRA</RNText>
            </View>
          )}
        </View>
        <RNText className="text-zinc-300 text-xs mb-2 flex-1" numberOfLines={3}>
          {card.description}
        </RNText>
        <View className={cn('border-t border-current/20 pt-2 mt-auto', houseTextColors[card.house])}>
          <RNText className="text-[10px] font-medium opacity-70">
            {card.houseAdvantage}
          </RNText>
        </View>
      </View>
    );
  }

  return (
    <View className={cn(
      'w-full flex-row items-center gap-3 p-3 rounded-lg border bg-zinc-900/50 mb-2',
      borderColor
    )}>
      <View className={cn('w-10 h-14 rounded bg-zinc-800 border justify-center items-center', borderColor)}>
        <RNText className={cn('text-[10px] font-bold', textColor)}>
          {card.house[0]}
        </RNText>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <RNText className="text-sm font-semibold text-zinc-100">{card.name}</RNText>
          {card.isCounter && (
            <View className="bg-gryffindor/30 px-1.5 rounded">
              <RNText className="text-[9px] font-bold text-gryffindor-light">CONTRA</RNText>
            </View>
          )}
        </View>
        <RNText className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>{card.description}</RNText>
      </View>
      <View className={cn('w-2 h-2 rounded-full', borderColor.replace('border-', 'bg-'))} />
    </View>
  );
}