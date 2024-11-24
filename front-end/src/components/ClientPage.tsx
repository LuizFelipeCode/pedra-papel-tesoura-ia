'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import GameModeSelection from './GameModeSelection';
import type { GameConfig } from '@/types/game';

// Importe o GameInterface com noSSR
const GameInterface = dynamic(
  () => import('./GameInterface'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando câmera...</div>
      </div>
    )
  }
);

interface GameState {
  screen: 'mode-selection' | 'game';
  config: GameConfig | null;
}

const ClientPage = () => {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'mode-selection',
    config: null
  });

  const handleModeSelect = (config: GameConfig) => {
    setGameState({
      screen: 'game',
      config
    });
  };

  const handleReturnToMenu = () => {
    setGameState({
      screen: 'mode-selection',
      config: null
    });
  };

  // Renderize diretamente sem Suspense
  return gameState.screen === 'mode-selection' ? (
    <GameModeSelection onSelectMode={handleModeSelect} />
  ) : (
    <GameInterface 
      config={gameState.config} 
      onReturnToMenu={handleReturnToMenu}
    />
  );
};

export default ClientPage;