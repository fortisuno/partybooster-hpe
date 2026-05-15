import { Button as UIButton } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import type { House } from '@/types';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  house?: House;
}

export function CustomButton({ house, className, children, ...props }: CustomButtonProps) {
  const getHouseVariant = (house?: House): ButtonProps['variant'] => {
    if (!house) return 'default';
    const map: Record<House, ButtonProps['variant']> = {
      Gryffindor: 'gryffindor',
      Hufflepuff: 'hufflepuff',
      Ravenclaw: 'ravenclaw',
      Slytherin: 'slytherin',
    };
    return map[house];
  };

  return (
    <UIButton
      variant={house ? getHouseVariant(house) : 'default'}
      className={className}
      {...props}
    >
      {children}
    </UIButton>
  );
}