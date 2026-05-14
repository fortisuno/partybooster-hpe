import { Text as RNText } from 'react-native';
import { cn } from '../../lib/cn';

type HeadingLevel = 1 | 2 | 3;

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

const levelClasses: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold text-zinc-100',
  2: 'text-2xl font-semibold text-zinc-200',
  3: 'text-xl font-medium text-zinc-300',
};

export function Heading({ level = 1, children, className }: HeadingProps) {
  return (
    <RNText className={cn(levelClasses[level], className)}>
      {children}
    </RNText>
  );
}