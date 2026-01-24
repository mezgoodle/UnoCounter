export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface Round {
  turnNumber: number;
  scores: { playerId: string; score: number }[];
  timestamp: Date;
}

export interface Game {
  id: string;
  players: Player[];
  currentTurn: number;
  dealerId: string;
  rounds: Round[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateGameData {
  playerNames: string[];
}

export interface AddRoundData {
  scores: { playerId: string; score: number }[];
}
