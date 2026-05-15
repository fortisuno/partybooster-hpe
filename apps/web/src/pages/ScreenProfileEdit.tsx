import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import type { House } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HouseSelector } from '@/components/molecules/HouseSelector';

export function ScreenProfileEdit() {
  const { userProfile, updateUserProfile, goBack } = useGameStore();

  const [name, setName] = useState(userProfile.name);
  const [selectedHouse, setSelectedHouse] = useState<House>(userProfile.house);

  const hasChanges = name !== userProfile.name || selectedHouse !== userProfile.house;

  const handleSave = () => {
    updateUserProfile({ name, house: selectedHouse });
    goBack();
  };

  const screenVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      key="profile-edit"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-full overflow-hidden pt-16"
    >
      <div className="flex-1 max-w-sm mx-auto w-full">
        <h2 className="font-display text-2xl font-bold text-white/90 mb-2">
          Editar Perfil
        </h2>
        <p className="text-xs text-white/30 mb-8 font-body">
          Tu identidad de mago en la arena
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] text-white/40 uppercase tracking-[0.12em] font-medium font-body block">
              Nombre de Mago
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre de mago"
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] text-white/40 uppercase tracking-[0.12em] font-medium font-body block">
              Tu Casa
            </label>
            <HouseSelector
              selectedHouse={selectedHouse}
              onSelect={setSelectedHouse}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full"
          size="lg"
        >
          <Save size={16} />
          Guardar Cambios
        </Button>
        <button
          onClick={goBack}
          className="w-full h-10 rounded-2xl text-xs text-white/20 hover:text-white/40 transition-colors font-body"
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  );
}