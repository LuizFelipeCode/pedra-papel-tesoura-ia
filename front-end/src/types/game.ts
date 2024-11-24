export type Move = 'pedra' | 'papel' | 'tesoura' | null;
export type Winner = 'player' | 'computer' | 'draw' | null;
export type GameState = 'waiting' | 'playing' | 'result';

export interface GameResult {
  player: Move;
  computer: Move;
  winner: Winner;
}

export interface GameScore {
  player: number;
  computer: number;
}

export interface GameConfig {
  maxRounds?: number;
  cheatMode?: boolean;
}

export interface PredictionResponse {
  player_move: Move;
  computer_move: Move;
  winner: Winner;
}