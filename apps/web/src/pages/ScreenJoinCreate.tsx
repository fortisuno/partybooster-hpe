import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/organisms/Header';

export function ScreenJoinCreate() {
  const { connect, createRoom, joinRoom, isConnected } = useGameStore();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  const handleCreateRoom = () => {
    setIsLoading(true);
    const name = useGameStore.getState().userProfile.name;
    const house = useGameStore.getState().userProfile.house;
    createRoom(name, house);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleJoinRoom = () => {
    if (roomCode.length < 5) return;
    setIsLoading(true);
    const name = useGameStore.getState().userProfile.name;
    const house = useGameStore.getState().userProfile.house;
    joinRoom(roomCode, name, house);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const screenVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <Header />
      <motion.div
        key="join-create"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center h-full pt-20 px-6"
      >
        <div className="text-center mb-24">
          <h1 className="font-display text-4xl font-bold tracking-wide text-white">
            Sortilegios
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200/90 to-amber-400/80">
              Weasley
            </span>
          </h1>
          <p className="text-white/30 text-sm mt-3 font-body tracking-wide italic">
            Travesura realizada... y trago fondo
          </p>
        </div>

        {!isConnected ? (
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-body">Conectando al servidor...</p>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] text-white/40 text-center uppercase tracking-[0.12em] font-medium font-body block">
                Ingresa el Código de Sala
              </label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="WZRD-XXXX"
                maxLength={9}
                className="text-center font-display tracking-[0.15em]"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={roomCode.length < 5 || isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Uniéndose...' : 'Unirse a la Sala'}
            </Button>

            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full h-11 rounded-2xl font-medium text-sm tracking-wide transition-all duration-200 active:scale-[0.98] text-white/50 hover:text-white/80 border border-white/8 bg-transparent disabled:opacity-40"
            >
              Crear Sala
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}