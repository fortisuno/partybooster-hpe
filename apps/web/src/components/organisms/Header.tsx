import { Edit2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { HouseShield } from '@/components/atoms/HouseShield';
import { TurnDot } from '@/components/atoms/TurnDot';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { userProfile, currentScreen, goToProfile } = useGameStore();

  const hideEdit = currentScreen === 'profile-edit';

  return (
    <header
      className={cn(
        'fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50 px-4 pt-3',
        className
      )}
    >
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
        <button
          onClick={goToProfile}
          className="flex items-center gap-3 group"
        >
          <div className="transition-transform duration-200 group-active:scale-95">
            <HouseShield house={userProfile.house} size={36} active />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white/90 font-body">
              {userProfile.name}
            </span>
            {!hideEdit && (
              <span className="text-white/30 group-hover:text-white/60 transition-colors">
                <Edit2 size={12} />
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <TurnDot />
          <span className="text-[11px] text-white/40 font-medium tracking-wide font-body uppercase">
            En línea
          </span>
        </div>
      </div>
    </header>
  );
}