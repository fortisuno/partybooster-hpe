import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MobileLayout } from '@/components/templates/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import type { House } from '@/types';

const HOUSES: { value: House; label: string; color: string }[] = [
  { value: 'Gryffindor', label: 'Gryffindor', color: 'bg-gryffindor' },
  { value: 'Hufflepuff', label: 'Hufflepuff', color: 'bg-hufflepuff' },
  { value: 'Ravenclaw', label: 'Ravenclaw', color: 'bg-ravenclaw' },
  { value: 'Slytherin', label: 'Slytherin', color: 'bg-slytherin' },
];

type Tab = 'create' | 'join';

export default function Home() {
  const { connect, createRoom, joinRoom, lastError, clearError, isConnected, isLoading } = useGameStore();

  const [tab, setTab] = useState<Tab>('create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const handleConnect = () => {
    connect();
  };

  const handleAction = () => {
    if (!name.trim() || !selectedHouse) return;
    if (tab === 'create') {
      createRoom(name.trim(), selectedHouse);
    } else {
      if (!roomCode.trim()) return;
      joinRoom(roomCode.trim(), name.trim(), selectedHouse);
    }
  };

  const isValid = name.trim().length > 0 && selectedHouse !== null && (tab === 'create' || roomCode.trim().length > 0);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api-partybooster-hpe.rehiletehvac.com';

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen">
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold text-zinc-100 text-center mb-1">
            Cartas de Harry Potter
          </h1>
          <p className="text-sm text-zinc-500 text-center">
            Juego de cartas multijugador en tiempo real
          </p>
        </div>

        <div className="flex px-6 gap-2">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'create'
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Crear Sala
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'join'
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Unirse a la Sala
          </button>
        </div>

        <div className="flex-1 p-6 space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Tu Nombre
                </label>
                <Input
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                />
              </div>

              {tab === 'join' && (
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Código de Sala
                  </label>
                  <Input
                    placeholder="ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg font-mono tracking-widest"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Selecciona Tu Casa
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSES.map((house) => (
                    <button
                      key={house.value}
                      onClick={() => setSelectedHouse(house.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedHouse === house.value
                          ? 'border-zinc-100 bg-zinc-800'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${house.color} mb-2`} />
                      <span className="text-xs font-medium text-zinc-300">{house.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {lastError && (
            <Card className="border-red-800 bg-red-900/20">
              <CardContent className="pt-4">
                <p className="text-sm text-red-400">{lastError}</p>
                <button onClick={clearError} className="text-xs text-red-500 mt-1 hover:underline">
                  Cerrar
                </button>
              </CardContent>
            </Card>
          )}

          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isLoading} size="lg" className="w-full">
              Conectar al Servidor
            </Button>
          ) : (
            <Button
              onClick={handleAction}
              disabled={isLoading || !isValid}
              size="lg"
              className="w-full"
            >
              {tab === 'create' ? 'Crear Sala' : 'Unirse a la Sala'}
            </Button>
          )}
        </div>

        <div className="p-6 pt-0">
          <p className="text-xs text-zinc-600 text-center">
            Conectando a: {apiUrl}
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}