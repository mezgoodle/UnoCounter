import { createGame, addRound, getGames, generateId } from "../app/lib/storage";

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
});

describe("Storage Logic - Dealer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("createGame assigns a random dealer", () => {
    const game = createGame({
      playerNames: ["Alice", "Bob", "Charlie"],
    });

    expect(game.dealerId).toBeDefined();
    expect(game.players.some((p) => p.id === game.dealerId)).toBe(true);
  });

  test("addRound rotates the dealer", () => {
    const game = createGame({
      playerNames: ["p1", "p2", "p3"],
    });

    game.players[0].id = "1";
    game.players[1].id = "2";
    game.players[2].id = "3";
    game.dealerId = "1";

    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0;
    global.Math = mockMath;

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
  });

  test("getGames assigns default dealerId for legacy games", () => {
    const legacyGame = {
      id: "legacy",
      players: [{ id: "p1", name: "Alice", totalScore: 0 }],
      currentTurn: 1,
      rounds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    localStorage.setItem("unocounter_games", JSON.stringify([legacyGame]));

    const games = getGames();
    expect(games[0].dealerId).toBe("p1");
  });
});
