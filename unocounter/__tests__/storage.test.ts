import {
  createGame,
  addRound,
  getGames,
  saveGames,
  deleteGame,
  endGame,
} from "../app/lib/storage";

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Storage Logic", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Dealer Logic", () => {
    test("createGame assigns a random dealer", () => {
      const game = createGame({
        playerNames: ["Alice", "Bob", "Charlie"],
      });

      expect(game.dealerId).toBeDefined();
      expect(game.players.some((p) => p.id === game.dealerId)).toBe(true);
    });

    test("addRound rotates the dealer", () => {
      const originalMath = global.Math;
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0;
      global.Math = mockMath;

      try {
        const fixedGame = createGame({
          playerNames: ["A", "B", "C"],
        });

        expect(fixedGame.dealerId).toBe(fixedGame.players[0].id);

        const updatedGame = addRound(fixedGame.id, {
          scores: fixedGame.players.map((p) => ({ playerId: p.id, score: 10 })),
        });

        expect(updatedGame).not.toBeNull();
        expect(updatedGame?.dealerId).toBe(fixedGame.players[1].id);

        const updatedGame2 = addRound(fixedGame.id, {
          scores: fixedGame.players.map((p) => ({ playerId: p.id, score: 10 })),
        });
        expect(updatedGame2?.dealerId).toBe(fixedGame.players[2].id);
        const updatedGame3 = addRound(fixedGame.id, {
          scores: fixedGame.players.map((p) => ({ playerId: p.id, score: 10 })),
        });

        expect(updatedGame3?.dealerId).toBe(fixedGame.players[0].id);
      } finally {
        global.Math = originalMath;
      }
    });
  });

  describe("Coverage / Edge Cases", () => {
    test("getGames returns empty array on JSON parse error", () => {
      localStorage.setItem("unocounter_games", "invalid-json");
      const games = getGames();
      expect(games).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    test("saveGames handles localStorage errors", () => {
      const setItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error("Storage full");
      });

      saveGames([]);
      expect(console.error).toHaveBeenCalled();

      // Restore
      localStorage.setItem = setItem;
    });

    test("deleteGame returns false if game not found", () => {
      const result = deleteGame("non-existent");
      expect(result).toBe(false);
    });

    test("endGame returns null if game not found", () => {
      const result = endGame("non-existent");
      expect(result).toBeNull();
    });

    test("addRound returns null if game not found", () => {
      const result = addRound("non-existent", { scores: [] });
      expect(result).toBeNull();
    });

    test("addRound handles missing dealer in player list (fallback)", () => {
      const game = {
        id: "g1",
        players: [{ id: "p1", name: "A", totalScore: 0 }],
        currentTurn: 1,
        dealerId: "removed-player",
        rounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem("unocounter_games", JSON.stringify([game]));

      const updated = addRound("g1", { scores: [] });
      expect(updated?.dealerId).toBe("p1");
    });

    test("getGames handles corrupted dealerId (legacy)", () => {
      const game = {
        id: "g1",
        players: [{ id: "p1", name: "A", totalScore: 0 }],
        currentTurn: 1,
        rounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem("unocounter_games", JSON.stringify([game]));

      const games = getGames();
      expect(games[0].dealerId).toBe("p1");
    });

    test("getGames handles empty player list for legacy fallback", () => {
      const game = {
        id: "g1",
        players: [],
        currentTurn: 1,
        rounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem("unocounter_games", JSON.stringify([game]));
      const games = getGames();
      expect(games[0].dealerId).toBe("");
    });

    // New tests for missing coverage
    test("createGame with no players does not assign dealer", () => {
      const game = createGame({ playerNames: [] });
      expect(game.players.length).toBe(0);
      expect(game.dealerId).toBe("");
    });

    test("addRound with no current dealer keeps dealer empty", () => {
      const game = {
        id: "g_no_dealer",
        players: [], // Empty players to avoid getGames auto-healing dealerId
        currentTurn: 1,
        dealerId: "",
        rounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem("unocounter_games", JSON.stringify([game]));

      const updated = addRound("g_no_dealer", { scores: [] });
      expect(updated?.dealerId).toBe("");
    });

    test("addRound with missing dealer and empty players preserves invalid dealerId", () => {
      const game = {
        id: "g_empty",
        players: [],
        currentTurn: 1,
        dealerId: "missing_id",
        rounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem("unocounter_games", JSON.stringify([game]));

      // Verify what's in storage before call
      // const storedBefore = getGames();
      // console.log(
      //   "DEBUG: Stored Before",
      //   JSON.stringify(storedBefore, null, 2),
      // );

      const updated = addRound("g_empty", { scores: [] });
      // console.log("DEBUG: Updated Result", JSON.stringify(updated, null, 2));

      expect(updated?.dealerId).toBe("missing_id");
    });
  });
});
