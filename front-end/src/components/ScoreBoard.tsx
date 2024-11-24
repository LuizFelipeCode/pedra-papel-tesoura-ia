'use client';

import { Trophy } from 'lucide-react';
import { GameScore } from '@/types/game';

interface ScoreBoardProps {
  score: GameScore;
}

export const ScoreBoard = ({ score }: ScoreBoardProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white text-center">
        <h2 className="text-xl mb-2">Você</h2>
        <p className="text-3xl font-bold">{score.player}</p>
      </div>
      <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white text-center">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
        <p className="text-lg">Placar</p>
      </div>
      <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white text-center">
        <h2 className="text-xl mb-2">Computador</h2>
        <p className="text-3xl font-bold">{score.computer}</p>
      </div>
    </div>
  );
};

export default ScoreBoard;