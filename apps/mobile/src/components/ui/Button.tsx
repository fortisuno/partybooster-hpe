import type { ComponentProps } from 'react';
import { TouchableOpacity, Text as RNText } from 'react-native';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'danger' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gryffindor text-white border-gryffindor',
  danger: 'bg-transparent text-red-500 border-red-500',
  ghost: 'bg-transparent text-zinc-300 border-zinc-700',
};

export function Button({
  variant = 'primary',
  disabled = false,
  onPress,
  children,
  className,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={cn(
        'px-6 py-3 rounded-lg border-2 font-semibold text-center',
        variantClasses[variant],
        disabled && 'opacity-50',
        className
      )}
    >
      <RNText className={cn(
        'text-sm font-bold uppercase tracking-wide',
        variant === 'primary' ? 'text-white' : variant === 'danger' ? 'text-red-500' : 'text-zinc-300'
      )}>
        {children}
      </RNText>
    </TouchableOpacity>
  );
}