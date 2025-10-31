import {
  getGames,
  saveGames,
  createGame,
  getGame,
  addRound,
  endGame,
  deleteGame,
} from '../storage';
import { Game } from '../../types/game';

const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Storage functions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should create a new game', () => {
    const newGame = createGame({ playerNames: ['Alice', 'Bob'] });
    expect(newGame).toBeDefined();
    expect(newGame.players.length).toBe(2);
    expect(newGame.players[0].name).toBe('Alice');
  });

  it('should get all games', () => {
    createGame({ playerNames: ['Alice', 'Bob'] });
    const games = getGames();
    expect(games.length).toBe(1);
  });

  it('should get a specific game', () => {
    const newGame = createGame({ playerNames: ['Alice', 'Bob'] });
    const game = getGame(newGame.id);
    expect(game).toBeDefined();
    expect(game?.id).toBe(newGame.id);
  });

  it('should add a round to a game', () => {
    const newGame = createGame({ playerNames: ['Alice', 'Bob'] });
    const roundData = {
      scores: [
        { playerId: newGame.players[0].id, score: 10 },
        { playerId: newGame.players[1].id, score: 20 },
      ],
    };
    const updatedGame = addRound(newGame.id, roundData);
    expect(updatedGame?.rounds.length).toBe(1);
    expect(updatedGame?.players[0].totalScore).toBe(10);
  });

  it('should end a game', () => {
    const newGame = createGame({ playerNames: ['Alice', 'Bob'] });
    const endedGame = endGame(newGame.id);
    expect(endedGame?.isActive).toBe(false);
  });

  it('should delete a game', () => {
    const newGame = createGame({ playerNames: ['Alice', 'Bob'] });
    const isDeleted = deleteGame(newGame.id);
    expect(isDeleted).toBe(true);
    const games = getGames();
    expect(games.length).toBe(0);
  });

  it('should return null when getting a non-existent game', () => {
    const game = getGame('non-existent-id');
    expect(game).toBeNull();
  });

  it('should return null when adding a round to a non-existent game', () => {
    const updatedGame = addRound('non-existent-id', { scores: [] });
    expect(updatedGame).toBeNull();
  });

  it('should return null when ending a non-existent game', () => {
    const endedGame = endGame('non-existent-id');
    expect(endedGame).toBeNull();
  });

  it('should return false when deleting a non-existent game', () => {
    const isDeleted = deleteGame('non-existent-id');
    expect(isDeleted).toBe(false);
  });

  it('should handle JSON parsing errors gracefully', () => {
    window.localStorage.setItem('unocounter_games', 'invalid-json');
    const games = getGames();
    expect(games).toEqual([]);
  });
});
