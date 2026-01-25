/**
 * @jest-environment node
 */
import { getGames, saveGames } from "../app/lib/storage";

describe("Storage Logic (Server-Side/Node Environment)", () => {
  // In node environment, window is undefined

  test("getGames returns empty array when window is undefined", () => {
    const games = getGames();
    expect(games).toEqual([]);
  });

  test("saveGames does nothing and returns undefined when window is undefined", () => {
    const result = saveGames([]);
    expect(result).toBeUndefined();
  });
});
