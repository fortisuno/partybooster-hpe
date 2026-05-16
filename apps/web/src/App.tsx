import { useGameStore } from '@/store/useGameStore';
import { RootLayout } from '@/components/templates/RootLayout';
import { ScreenJoinCreate } from '@/pages/ScreenJoinCreate';
import { ScreenLobby } from '@/pages/ScreenLobby';
import { ScreenGameArena } from '@/pages/ScreenGameArena';
import { ScreenProfileEdit } from '@/pages/ScreenProfileEdit';
import { ScreenCardInfo } from '@/pages/ScreenCardInfo';
import './index.css';

export default function App() {
  const { currentScreen } = useGameStore();

  return (
    <RootLayout>
      {currentScreen === 'join-create' && <ScreenJoinCreate />}
      {currentScreen === 'lobby' && <ScreenLobby />}
      {currentScreen === 'game-arena' && <ScreenGameArena />}
      {currentScreen === 'profile-edit' && <ScreenProfileEdit />}
      {currentScreen === 'card-info' && <ScreenCardInfo />}
    </RootLayout>
  );
}
