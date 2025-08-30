import { Game, CreateGameData, AddRoundData, Round } from "../types/game";

const GAMES_STORAGE_KEY = "unocounter_games";

// Generate unique ID for games
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all games from storage
export const getGames = (): Game[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GAMES_STORAGE_KEY);
    if (!stored) return [];

    const games = JSON.parse(stored);
    // Convert date strings back to Date objects
    return games.map((game: Game) => ({
      ...game,
      createdAt: new Date(game.createdAt),
      updatedAt: new Date(game.updatedAt),
      rounds: game.rounds.map((round: Round) => ({
        ...round,
        timestamp: new Date(round.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error loading games:", error);
    return [];
  }
};

// Save all games to storage
export const saveGames = (games: Game[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error("Error saving games:", error);
  }
};

// Create a new game
export const createGame = (data: CreateGameData): Game => {
  const games = getGames();

  const newGame: Game = {
    id: generateId(),
    players: data.playerNames.map((name) => ({
      id: generateId(),
      name,
      totalScore: 0,
    })),
    currentTurn: 1,
    rounds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  games.push(newGame);
  saveGames(games);

  return newGame;
};

// Get a specific game by ID
export const getGame = (id: string): Game | null => {
  const games = getGames();
  return games.find((game) => game.id === id) || null;
};

// Add a round to a game
export const addRound = (gameId: string, data: AddRoundData): Game | null => {
  const games = getGames();
  const gameIndex = games.findIndex((game) => game.id === gameId);

  if (gameIndex === -1) return null;

  const game = games[gameIndex];
  const newRound = {
    turnNumber: game.currentTurn,
    scores: data.scores,
    timestamp: new Date(),
  };

  // Update player total scores
  const updatedPlayers = game.players.map((player) => {
    const roundScore = data.scores.find(
      (score) => score.playerId === player.id
    );
    return {
      ...player,
      totalScore: player.totalScore + (roundScore?.score || 0),
    };
  });

  const updatedGame: Game = {
    ...game,
    players: updatedPlayers,
    currentTurn: game.currentTurn + 1,
    rounds: [...game.rounds, newRound],
    updatedAt: new Date(),
  };

  games[gameIndex] = updatedGame;
  saveGames(games);

  return updatedGame;
};

// End a game (mark as inactive)
export const endGame = (gameId: string): Game | null => {
  const games = getGames();
  const gameIndex = games.findIndex((game) => game.id === gameId);

  if (gameIndex === -1) return null;

  const updatedGame: Game = {
    ...games[gameIndex],
    isActive: false,
    updatedAt: new Date(),
  };

  games[gameIndex] = updatedGame;
  saveGames(games);

  return updatedGame;
};

// Delete a game
export const deleteGame = (gameId: string): boolean => {
  const games = getGames();
  const filteredGames = games.filter((game) => game.id !== gameId);

  if (filteredGames.length === games.length) return false;

  saveGames(filteredGames);
  return true;
};
