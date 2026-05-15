import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

interface DrawButtonProps {
  className?: string;
}

export function DrawButton({ className }: DrawButtonProps) {
  const { drawCard } = useGameStore();

  const handleDraw = () => {
    drawCard();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center', className)}
    >
      <motion.button
        onClick={handleDraw}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'w-20 h-20 rounded-full glass-strong flex items-center justify-center',
          'border border-white/10 hover:border-white/20',
          'shadow-[0_0_30px_rgba(212,168,67,0.08)] hover:shadow-[0_0_40px_rgba(212,168,67,0.15)]',
          'active:scale-90 transition-all duration-200'
        )}
      >
        <ArrowUp size={28} className="text-white/70" />
      </motion.button>
      <p className="text-center text-[10px] text-white/20 mt-2 uppercase tracking-[0.1em] font-body">
        Robar
      </p>
    </motion.div>
  );
}