'use client';

import { useState } from 'react';
import { Trophy, Swords, Flame } from 'lucide-react';
import { GameConfig } from '@/types/game';

interface GameModeProps {
  onSelectMode: (config: GameConfig) => void;
}

const GameModeSelection = ({ onSelectMode }: GameModeProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const gameModes = [
    {
      id: 'best-of-3',
      title: 'Melhor de 3',
      icon: Trophy,
      description: 'Modo clássico! Vença 2 partidas para ser o campeão.',
      color: 'from-blue-600 to-blue-800',
      config: { maxRounds: 3 }
    },
    {
      id: 'best-of-5',
      title: 'Melhor de 5',
      icon: Swords,
      description: 'Para os mais determinados! Primeira equipe a vencer 3 partidas.',
      color: 'from-purple-600 to-purple-800',
      config: { maxRounds: 5 }
    },
    {
      id: 'cheat-mode',
      title: 'Modo Roubo',
      icon: Flame,
      description: 'Modo especial onde você pode ver a jogada do computador antes!',
      color: 'from-red-600 to-red-800',
      config: { cheatMode: true }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8 pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pedra, Papel e Tesoura
          </h1>
          <p className="text-xl text-gray-300">
            Escolha seu modo de jogo e prepare-se para a batalha!
          </p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 transform cursor-pointer
                  ${hoveredCard === mode.id ? 'scale-105' : 'scale-100'}
                `}
                onMouseEnter={() => setHoveredCard(mode.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onSelectMode(mode.config)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-90`} />
                
                <div className="relative p-6 text-white">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Icon className="w-16 h-16" />
                    <h2 className="text-2xl font-bold">{mode.title}</h2>
                    <p className="text-gray-100">{mode.description}</p>
                    
                    <button 
                      className="mt-4 bg-white text-gray-900 hover:bg-gray-200 transition-colors px-6 py-2 rounded-full font-semibold"
                      onClick={() => onSelectMode(mode.config)}
                    >
                      Jogar Agora
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            Use sua câmera para jogar e divirta-se!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;