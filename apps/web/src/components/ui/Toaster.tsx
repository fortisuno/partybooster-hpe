import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast, type Toast } from './useToast';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'pointer-events-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 shadow-lg border',
        toast.variant === 'success' && 'bg-emerald-900/80 border-emerald-700/50',
        toast.variant === 'error' && 'bg-red-900/80 border-red-700/50',
        toast.variant !== 'success' && toast.variant !== 'error' && 'glass-strong border-white/10'
      )}
    >
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium text-white/90">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-xs text-white/60 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/30 hover:text-white/60 transition-colors text-xs"
      >
        ✕
      </button>
    </motion.div>
  );
}

interface ToasterProps {
  className?: string;
}

export function Toaster({ className }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-mobile px-4 pb-6 safe-area-bottom',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}