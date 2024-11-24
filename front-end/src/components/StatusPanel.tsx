'use client';

import { Scissors, Hand, Square } from 'lucide-react';
import { GameState, GameResult } from '@/types/game';

interface StatusPanelProps {
  gameState: GameState;
  result: GameResult;
}

export const StatusPanel = ({ gameState, result }: StatusPanelProps) => {
  return (
    <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Status do Jogo</h2>
      
      {gameState === 'result' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg mb-2">Você</p>
              <div className="text-4xl">
                {result.player === 'pedra' && '🪨'}
                {result.player === 'papel' && '📄'}
                {result.player === 'tesoura' && '✂️'}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl">VS</span>
            </div>
            <div>
              <p className="text-lg mb-2">Computador</p>
              <div className="text-4xl">
                {result.computer === 'pedra' && '🪨'}
                {result.computer === 'papel' && '📄'}
                {result.computer === 'tesoura' && '✂️'}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xl font-bold">
              {result.winner === 'player' && '🎉 Você venceu! 🎉'}
              {result.winner === 'computer' && '😔 Computador venceu!'}
              {result.winner === 'draw' && '🤝 Empate!'}
            </p>
          </div>
        </div>
      )}

      {gameState === 'waiting' && (
        <div className="space-y-4 text-center">
          <p className="text-gray-300">Prepare-se para jogar!</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <Square className="w-8 h-8 mb-2" />
              <span>Pedra</span>
            </div>
            <div className="flex flex-col items-center">
              <Hand className="w-8 h-8 mb-2" />
              <span>Papel</span>
            </div>
            <div className="flex flex-col items-center">
              <Scissors className="w-8 h-8 mb-2" />
              <span>Tesoura</span>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="text-center">
          <p className="text-xl">Faça seu gesto!</p>
          <p className="text-gray-300 mt-2">
            A câmera irá capturar seu movimento...
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusPanel;