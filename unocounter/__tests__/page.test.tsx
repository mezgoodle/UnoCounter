import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../app/page";
import { getGames, deleteGame } from "../app/lib/storage";
import { Game } from "../app/types/game";
import { Player } from "../app/types/game";

jest.mock("../app/lib/storage");

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
}));

const mockedGetGames = getGames as jest.MockedFunction<typeof getGames>;
const mockedDeleteGame = deleteGame as jest.MockedFunction<typeof deleteGame>;

global.confirm = jest.fn(() => true);

const mockPlayers: Player[] = [
  { id: "p1", name: "Alice", totalScore: 0 },
  { id: "p2", name: "Bob", totalScore: 0 },
  { id: "p3", name: "Charlie", totalScore: 0 },
  { id: "p4", name: "Dave", totalScore: 0 },
];

const mockActiveGame: Game = {
  id: "1",
  players: mockPlayers.slice(0, 2),
  createdAt: new Date(),
  updatedAt: new Date(),
  currentTurn: 1,
  isActive: true,
  rounds: [],
};

const mockFinishedGame: Game = {
  id: "2",
  players: mockPlayers.slice(2, 4),
  createdAt: new Date(),
  updatedAt: new Date(),
  currentTurn: 1,
  isActive: false,
  rounds: [],
};

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when no games are available", () => {
    mockedGetGames.mockReturnValue([]);

    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /UNO Score Tracker/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/No games yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Your First Game/i })
    ).toBeInTheDocument();

    expect(screen.queryByText(/Active Games/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Finished Games/i)).not.toBeInTheDocument();
  });

  test("opens create form when clicking 'Create Your First Game'", () => {
    mockedGetGames.mockReturnValue([]);
    render(<Home />);

    const createButton = screen.getByRole("button", {
      name: /Create Your First Game/i,
    });
    fireEvent.click(createButton);

    expect(
      screen.getByRole("heading", { name: /Create New Game/i })
    ).toBeInTheDocument();
  });

  test("displays active and finished games from storage", () => {
    mockedGetGames.mockReturnValue([mockActiveGame, mockFinishedGame]);

    render(<Home />);

    expect(screen.getByText(/Active Games \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Finished Games \(1\)/i)).toBeInTheDocument();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("shows the create game form when 'Start New Game' is clicked and hides it on 'Cancel'", () => {
    mockedGetGames.mockReturnValue([]);
    render(<Home />);

    const startButton = screen.getByRole("button", {
      name: /Start New Game/i,
    });
    fireEvent.click(startButton);

    expect(
      screen.getByRole("heading", { name: /Create New Game/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();

    expect(startButton).not.toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(
      screen.queryByRole("heading", { name: /Create New Game/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start New Game/i })
    ).toBeInTheDocument();
  });

  test("calls deleteGame and refreshes games when deletion is confirmed", () => {
    mockedGetGames.mockReturnValueOnce([mockActiveGame]);

    mockedGetGames.mockReturnValueOnce([]);
    mockedDeleteGame.mockReturnValue(true);

    render(<Home />);

    expect(screen.getByText("Alice")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    // Assert
    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this game? This action cannot be undone."
    );
    expect(mockedDeleteGame).toHaveBeenCalledWith(mockActiveGame.id);
    expect(mockedGetGames).toHaveBeenCalledTimes(2);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();

    expect(screen.getByText(/No games yet/i)).toBeInTheDocument();
  });

  test("does not call deleteGame if deletion is not confirmed", () => {
    (global.confirm as jest.Mock).mockReturnValue(false);
    mockedGetGames.mockReturnValue([mockActiveGame]);

    render(<Home />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockedDeleteGame).not.toHaveBeenCalled();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
