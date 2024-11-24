// components/GameInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { CameraService } from '../services/cameraService';
import ScoreBoard from './ScoreBoard';
import StatusPanel from './StatusPanel';
import VideoComponent from './VideoComponent';
import { GameConfig, GameResult, GameScore, GameState, Winner } from '@/types/game';

interface GameInterfaceProps {
  config: GameConfig | null;
  onReturnToMenu: () => void;
}

const GameInterface = ({ config, onReturnToMenu }: GameInterfaceProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<GameState>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<GameResult>({
    player: null,
    computer: null,
    winner: null,
  });
  const [score, setScore] = useState<GameScore>({
    player: 0,
    computer: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const maxScore = config?.maxRounds === 3 ? 2 : 3;
  const isGameOver = score.player === maxScore || score.computer === maxScore;

  const updateScore = (winner: Winner) => {
    if (winner === 'player' || winner === 'computer') {
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    }
  };

  const startGame = async () => {
    try {
      await CameraService.startCamera(videoRef);
      setGameState('playing');
      setCountdown(3);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handlePlayAgain = () => {
    if (isGameOver) {
      onReturnToMenu();
    } else {
      setGameState('waiting');
      setCountdown(3);
      setResult({
        player: null,
        computer: null,
        winner: null,
      });
    }
  };

  const captureAndProcessFrame = async () => {
    setIsProcessing(true);
    try {
      // Captura o frame atual
      const frameData = CameraService.captureFrame(videoRef, canvasRef);
      if (!frameData) {
        throw new Error('Não foi possível capturar a imagem');
      }

      // Envia para a API e aguarda o resultado
      const prediction = await CameraService.sendFrameToAPI(frameData);

      // Atualiza o estado com o resultado
      setResult({
        player: prediction.player_move,
        computer: prediction.computer_move,
        winner: prediction.winner,
      });

      // Atualiza o placar
      updateScore(prediction.winner);

      // Muda o estado do jogo para mostrar o resultado
      setGameState('result');
    } catch (error) {
      console.error('Erro ao processar jogada:', error);
      alert('Erro ao processar sua jogada. Tente novamente.');
      setGameState('waiting');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'playing' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (gameState === 'playing' && countdown === 0) {
      captureAndProcessFrame();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, countdown]);

  useEffect(() => {
    return () => {
      CameraService.stopCamera(videoRef);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      {/* Botão Voltar */}
      <button
        onClick={onReturnToMenu}
        className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
      >
        Voltar ao Menu
      </button>

      {/* Indicador de Modo Roubo */}
      {config?.cheatMode && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
          Modo Roubo Ativo
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Pedra, Papel e Tesoura</h1>
          <p className="text-gray-300">Jogue usando sua câmera!</p>
        </div>

        {/* Placar */}
        <ScoreBoard score={score} />

        {/* Área do Jogo */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Câmera */}
          <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative">
              {gameState === 'waiting' ? (
                <Camera className="w-16 h-16 text-gray-600" />
              ) : (
                <>
                  <VideoComponent />
                  {(gameState === 'playing' || isProcessing) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-white bg-black/50 rounded-full w-20 h-20 flex items-center justify-center">
                        {countdown > 0 ? countdown : '📸'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="text-center">
              {gameState === 'waiting' && (
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                >
                  Iniciar Jogo
                </button>
              )}
              {gameState === 'playing' && (
                <p className="text-lg">Prepare seu gesto...</p>
              )}
              {gameState === 'result' && !isGameOver && (
                <button
                  onClick={handlePlayAgain}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full inline-flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </button>
              )}
              {isProcessing && (
                <p className="text-lg">Processando sua jogada...</p>
              )}
            </div>
          </div>

          {/* Status */}
          <StatusPanel gameState={gameState} result={result} />
        </div>
      </div>

      {/* Modal de Fim de Jogo */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {score.player > score.computer ? 'Você Venceu o Jogo!' : 'Computador Venceu o Jogo!'}
            </h2>
            <p className="mb-6 text-gray-600">
              Placar Final: {score.player} x {score.computer}
            </p>
            <button
              onClick={onReturnToMenu}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInterface;