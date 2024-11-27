'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ScoreBoard from './ScoreBoard';
import StatusPanel from './StatusPanel';
import { GameConfig, GameResult, GameScore, GameState, Winner } from '@/types/game';

interface GameInterfaceProps {
  config: GameConfig | null;
  onReturnToMenu: () => void;
}

const GameInterface = ({ config, onReturnToMenu }: GameInterfaceProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const [showError, setShowError] = useState(false);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      return false;
    }
  };

  const startGame = async () => {
    try {
      const cameraStarted = await startCamera();
      if (!cameraStarted) {
        throw new Error('Não foi possível iniciar a câmera');
      }
      setGameState('playing');
      setCountdown(3);
    } catch (error) {
      alert('Erro ao acessar a câmera. Verifique suas permissões.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handlePlayAgain = () => {
    if (isGameOver) {
      stopCamera();
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
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      // Captura o frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Não foi possível obter o contexto do canvas');
      
      // Desenha o frame atual no canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converte para base64
      const frameData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      // Envia para API
      const response = await fetch(`http://localhost:8000/predicao?cheat_mode=${config?.cheatMode ? 'true' : 'false'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: frameData,
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível reconhecer seu gesto');
      }

      const prediction = await response.json();

      setResult({
        player: prediction.player_move,
        computer: prediction.computer_move,
        winner: prediction.winner,
      });

      updateScore(prediction.winner);
      setGameState('result');
    } catch (error) {
      console.error('Erro ao processar jogada:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
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
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <button
        onClick={onReturnToMenu}
        className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
      >
        Voltar ao Menu
      </button>

      {config?.cheatMode && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
          Modo Roubo Ativo
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Pedra, Papel e Tesoura</h1>
          <p className="text-gray-300">Jogue usando sua câmera!</p>
        </div>

        <ScoreBoard score={score} />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg text-white">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${gameState === 'waiting' ? 'hidden' : ''}`}
              />
              {gameState === 'waiting' && (
                <Camera className="w-16 h-16 text-gray-600" />
              )}
              {(gameState === 'playing' || isProcessing) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white bg-black/50 rounded-full w-20 h-20 flex items-center justify-center">
                    {countdown > 0 ? countdown : '📸'}
                  </div>
                </div>
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

          <StatusPanel gameState={gameState} result={result} />
        </div>
      </div>

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

      {showError && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert variant="destructive" className="animate-in slide-in-from-right">
            <AlertTitle className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Ops! Não entendi seu gesto
            </AlertTitle>
            <AlertDescription>
              Por favor, tente novamente fazendo um dos gestos: ✊ (Pedra), ✋ (Papel) ou ✌️ (Tesoura)
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default GameInterface;