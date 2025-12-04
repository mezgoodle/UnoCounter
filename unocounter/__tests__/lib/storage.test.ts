import {
  generateId,
  getGames,
  saveGames,
  createGame,
  getGame,
  addRound,
  endGame,
  deleteGame,
} from "../../app/lib/storage";
import { Game } from "../../app/types/game";

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Storage Library", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("generateId", () => {
    test("generates unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test("generates non-empty string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("getGames", () => {
    test("returns empty array when no games stored", () => {
      const games = getGames();
      expect(games).toEqual([]);
    });

    test("returns games from localStorage", () => {
      const mockGames: Game[] = [
        {
          id: "game1",
          players: [{ id: "p1", name: "Alice", totalScore: 10 }],
          currentTurn: 1,
          rounds: [],
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          isActive: true,
        },
      ];

      localStorage.setItem("unocounter_games", JSON.stringify(mockGames));
      const games = getGames();

      expect(games).toHaveLength(1);
      expect(games[0].id).toBe("game1");
      expect(games[0].createdAt).toBeInstanceOf(Date);
      expect(games[0].updatedAt).toBeInstanceOf(Date);
    });

    test("converts date strings to Date objects", () => {
      const mockGames = [
        {
          id: "game1",
          players: [],
          currentTurn: 1,
          rounds: [
            {
              turnNumber: 1,
              scores: [],
              timestamp: "2023-01-01T12:00:00.000Z",
            },
          ],
          createdAt: "2023-01-01T10:00:00.000Z",
          updatedAt: "2023-01-01T11:00:00.000Z",
          isActive: true,
        },
      ];

      localStorage.setItem("unocounter_games", JSON.stringify(mockGames));
      const games = getGames();

      expect(games[0].createdAt).toBeInstanceOf(Date);
      expect(games[0].updatedAt).toBeInstanceOf(Date);
      expect(games[0].rounds[0].timestamp).toBeInstanceOf(Date);
    });

    test("handles corrupted data gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      localStorage.setItem("unocounter_games", "invalid json");

      const games = getGames();
      expect(games).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("saveGames", () => {
    test("saves games to localStorage", () => {
      const mockGames: Game[] = [
        {
          id: "game1",
          players: [{ id: "p1", name: "Alice", totalScore: 0 }],
          currentTurn: 1,
          rounds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      ];

      saveGames(mockGames);

      const stored = localStorage.getItem("unocounter_games");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("game1");
    });
  });

  describe("createGame", () => {
    test("creates a new game with player names", () => {
      const game = createGame({ playerNames: ["Alice", "Bob"] });

      expect(game.id).toBeTruthy();
      expect(game.players).toHaveLength(2);
      expect(game.players[0].name).toBe("Alice");
      expect(game.players[1].name).toBe("Bob");
      expect(game.players[0].totalScore).toBe(0);
      expect(game.currentTurn).toBe(1);
      expect(game.rounds).toEqual([]);
      expect(game.isActive).toBe(true);
      expect(game.createdAt).toBeInstanceOf(Date);
      expect(game.updatedAt).toBeInstanceOf(Date);
    });

    test("saves game to localStorage", () => {
      createGame({ playerNames: ["Alice", "Bob"] });

      const games = getGames();
      expect(games).toHaveLength(1);
    });

    test("assigns unique IDs to players", () => {
      const game = createGame({ playerNames: ["Alice", "Bob", "Charlie"] });

      const playerIds = game.players.map((p) => p.id);
      const uniqueIds = new Set(playerIds);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe("getGame", () => {
    test("retrieves game by ID", () => {
      const createdGame = createGame({ playerNames: ["Alice"] });
      const retrievedGame = getGame(createdGame.id);

      expect(retrievedGame).toBeTruthy();
      expect(retrievedGame!.id).toBe(createdGame.id);
    });

    test("returns null for non-existent game", () => {
      const game = getGame("non-existent-id");
      expect(game).toBeNull();
    });
  });

  describe("addRound", () => {
    test("adds round to game", () => {
      const game = createGame({ playerNames: ["Alice", "Bob"] });
      const updatedGame = addRound(game.id, {
        scores: [
          { playerId: game.players[0].id, score: 5 },
          { playerId: game.players[1].id, score: 10 },
        ],
      });

      expect(updatedGame).toBeTruthy();
      expect(updatedGame!.rounds).toHaveLength(1);
      expect(updatedGame!.rounds[0].turnNumber).toBe(1);
      expect(updatedGame!.rounds[0].scores).toHaveLength(2);
    });

    test("updates player scores", () => {
      const game = createGame({ playerNames: ["Alice", "Bob"] });
      const updatedGame = addRound(game.id, {
        scores: [
          { playerId: game.players[0].id, score: 5 },
          { playerId: game.players[1].id, score: 10 },
        ],
      });

      expect(updatedGame!.players[0].totalScore).toBe(5);
      expect(updatedGame!.players[1].totalScore).toBe(10);
    });

    test("increments turn number", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const updatedGame = addRound(game.id, {
        scores: [{ playerId: game.players[0].id, score: 5 }],
      });

      expect(updatedGame!.currentTurn).toBe(2);
    });

    test("updates updatedAt timestamp", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const originalUpdatedAt = game.updatedAt;

      // Wait a bit to ensure timestamp difference
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const updatedGame = addRound(game.id, {
        scores: [{ playerId: game.players[0].id, score: 5 }],
      });

      expect(updatedGame!.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    test("returns null for non-existent game", () => {
      const result = addRound("non-existent-id", { scores: [] });
      expect(result).toBeNull();
    });

    test("accumulates scores across multiple rounds", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const playerId = game.players[0].id;

      addRound(game.id, { scores: [{ playerId, score: 5 }] });
      const updatedGame = addRound(game.id, {
        scores: [{ playerId, score: 10 }],
      });

      expect(updatedGame!.players[0].totalScore).toBe(15);
    });
  });

  describe("endGame", () => {
    test("marks game as inactive", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const endedGame = endGame(game.id);

      expect(endedGame).toBeTruthy();
      expect(endedGame!.isActive).toBe(false);
    });

    test("updates updatedAt timestamp", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const originalUpdatedAt = game.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const endedGame = endGame(game.id);

      expect(endedGame!.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    test("returns null for non-existent game", () => {
      const result = endGame("non-existent-id");
      expect(result).toBeNull();
    });

    test("persists changes to localStorage", () => {
      const game = createGame({ playerNames: ["Alice"] });
      endGame(game.id);

      const retrievedGame = getGame(game.id);
      expect(retrievedGame!.isActive).toBe(false);
    });
  });

  describe("deleteGame", () => {
    test("deletes existing game", () => {
      const game = createGame({ playerNames: ["Alice"] });
      const result = deleteGame(game.id);

      expect(result).toBe(true);
      expect(getGame(game.id)).toBeNull();
    });

    test("returns false for non-existent game", () => {
      const result = deleteGame("non-existent-id");
      expect(result).toBe(false);
    });

    test("persists deletion to localStorage", () => {
      const game = createGame({ playerNames: ["Alice"] });
      deleteGame(game.id);

      const games = getGames();
      expect(games).toHaveLength(0);
    });

    test("deletes only specified game", () => {
      const game1 = createGame({ playerNames: ["Alice"] });
      const game2 = createGame({ playerNames: ["Bob"] });

      deleteGame(game1.id);

      const games = getGames();
      expect(games).toHaveLength(1);
      expect(games[0].id).toBe(game2.id);
    });
  });
});
