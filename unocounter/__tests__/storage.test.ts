import {
  createGame,
  addRound,
  getGames,
  saveGames,
  deleteGame,
  endGame,
  undoLastRound,
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

  describe("Undo Logic", () => {
    test("undoLastRound reverts scores, dealer, and round count", () => {
      // Setup
      const game = createGame({
        playerNames: ["A", "B", "C"],
      });
      // Force dealer to be A (index 0) for predictability if needed,
      // but let's just rely on logic.
      // Let's find initial dealer index
      const initialDealerId = game.dealerId;
      const dealers = game.players.map((p) => p.id);
      const initialDealerIndex = dealers.indexOf(initialDealerId);

      // Add a round
      const scores = game.players.map((p) => ({ playerId: p.id, score: 10 }));
      const afterRound1 = addRound(game.id, { scores });

      if (!afterRound1) throw new Error("Failed to add round 1");

      expect(afterRound1.rounds.length).toBe(1);
      expect(afterRound1.currentTurn).toBe(2);
      expect(afterRound1.players[0].totalScore).toBe(10); // Since we added 10

      // Identify expected dealer after round 1
      const expectedDealerIndexR1 = (initialDealerIndex + 1) % 3;
      expect(afterRound1.dealerId).toBe(dealers[expectedDealerIndexR1]);

      // Add another round
      const scores2 = game.players.map((p) => ({ playerId: p.id, score: 5 }));
      const afterRound2 = addRound(game.id, { scores: scores2 });

      if (!afterRound2) throw new Error("Failed to add round 2");

      expect(afterRound2.rounds.length).toBe(2);
      expect(afterRound2.currentTurn).toBe(3);
      expect(afterRound2.players[0].totalScore).toBe(15); // 10 + 5

      // Undo the last round (Round 2)
      const afterUndo = undoLastRound(game.id);

      if (!afterUndo) throw new Error("Failed to undo round");

      // Verify stats reverted to afterRound1 state
      expect(afterUndo.rounds.length).toBe(1);
      expect(afterUndo.currentTurn).toBe(2);
      expect(afterUndo.players[0].totalScore).toBe(10);

      // Dealer should be back to round 1's dealer
      expect(afterUndo.dealerId).toBe(afterRound1.dealerId);

      // Undo again (Undo Round 1)
      const afterUndo2 = undoLastRound(game.id);
      if (!afterUndo2) throw new Error("Failed to undo round 2");

      expect(afterUndo2.rounds.length).toBe(0);
      expect(afterUndo2.currentTurn).toBe(1);
      expect(afterUndo2.players[0].totalScore).toBe(0);
      expect(afterUndo2.dealerId).toBe(initialDealerId);
    });

    test("undoLastRound does nothing if no rounds exist", () => {
      const game = createGame({ playerNames: ["A"] });
      const afterUndo = undoLastRound(game.id);

      expect(afterUndo).not.toBeNull();
      expect(afterUndo?.rounds.length).toBe(0);
      expect(afterUndo?.currentTurn).toBe(1);
      expect(afterUndo?.id).toBe(game.id);
    });

    test("undoLastRound returns null if game not found", () => {
      const result = undoLastRound("non-existent");
      expect(result).toBeNull();
    });

    test("undoLastRound handles dealer rotation correctly wraps around", () => {
      // Setup game with 3 players
      const game = createGame({ playerNames: ["P1", "P2", "P3"] });
      // dealers: [P1, P2, P3]
      // initial dealer: let's assume P1 (index 0) for this test by forcing it if needed,
      // but createGame is random. We can just trust undoLastRound matches the reverse math.

      // Let's manually set dealer to index 0 (P1)
      game.dealerId = game.players[0].id;
      saveGames([game]);

      // Add round -> dealer becomes P2 (index 1)
      const afterRound = addRound(game.id, {
        scores: game.players.map((p) => ({ playerId: p.id, score: 0 })),
      });
      expect(afterRound?.dealerId).toBe(game.players[1].id);

      // Undo -> dealer should become P1 (index 0)
      const afterUndo = undoLastRound(game.id);
      expect(afterUndo?.dealerId).toBe(game.players[0].id);
    });

    test("undoLastRound preserves dealer if current dealer not found in players", () => {
      const game = createGame({ playerNames: ["A", "B"] });
      // Manually corrupt dealerId
      game.dealerId = "ghost_player";
      saveGames([game]);

      const afterUndo = undoLastRound(game.id);

      // Should preserve the ghost ID since it couldn't rotate
      expect(afterUndo?.dealerId).toBe("ghost_player");
    });
  });
});
