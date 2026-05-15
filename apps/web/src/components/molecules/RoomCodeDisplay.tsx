import { Copy } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';

interface RoomCodeDisplayProps {
  roomCode: string;
}

export function RoomCodeDisplay({ roomCode }: RoomCodeDisplayProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({ title: '¡Copiado!', variant: 'success' });
    } catch {
      toast({ title: 'Error al copiar', variant: 'error' });
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="font-display text-3xl tracking-[0.15em] text-white/90 font-medium">
        {roomCode}
      </span>
      <button
        onClick={handleCopy}
        className="p-2 rounded-xl glass hover:bg-white/10 transition-all active:scale-90"
      >
        <Copy size={18} className="text-white/40" />
      </button>
    </div>
  );
}