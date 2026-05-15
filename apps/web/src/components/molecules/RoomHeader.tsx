import { useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

export function RoomHeader() {
  const { roomCode, gameState, isConnected } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!roomCode) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const playerCount = gameState?.players.length ?? 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-lg font-mono font-bold text-zinc-100 tracking-wider">
            {roomCode}
          </span>
          <Copy className="w-4 h-4 text-zinc-400" />
        </button>
        {copied && (
          <span className="text-xs text-green-400">¡Copiado!</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Users className="w-4 h-4" />
        <span>{playerCount} jugador{playerCount !== 1 ? 'es' : ''}</span>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
    </div>
  );
}