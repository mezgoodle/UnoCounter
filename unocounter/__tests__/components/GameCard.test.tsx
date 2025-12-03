import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameCard from "../../app/components/GameCard";
import { Game } from "../../app/types/game";

const mockGame: Game = {
  id: "game-123",
  players: [
    { id: "p1", name: "Alice", totalScore: 10 },
    { id: "p2", name: "Bob", totalScore: 20 },
  ],
  createdAt: new Date("2023-01-01T12:00:00"),
  updatedAt: new Date("2023-01-01T13:00:00"),
  currentTurn: 0,
  isActive: true,
  rounds: [],
};

const mockFinishedGame: Game = {
  ...mockGame,
  id: "game-456",
  isActive: false,
  players: [
    { id: "p1", name: "Alice", totalScore: 10 }, // Winner
    { id: "p2", name: "Bob", totalScore: 50 },
  ],
};

describe("GameCard Component", () => {
  test("renders game details correctly", () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText(/Game #me-123/i)).toBeInTheDocument(); // slice(-6) of game-123 is me-123
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  test("renders finished game correctly with winner", () => {
    render(<GameCard game={mockFinishedGame} />);

    expect(screen.getByText(/Finished/i)).toBeInTheDocument();
    expect(screen.getByText(/Winner:/i)).toBeInTheDocument();
    // Alice appears in player list and winner section
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
  });

  test("shows 'Continue Game' button for active games", () => {
    render(<GameCard game={mockGame} />);
    expect(
      screen.getByRole("button", { name: /Continue Game/i })
    ).toBeInTheDocument();
  });

  test("shows 'View Game' button for finished games", () => {
    render(<GameCard game={mockFinishedGame} />);
    expect(
      screen.getByRole("button", { name: /View Game/i })
    ).toBeInTheDocument();
  });

  test("calls onDelete when delete button is clicked", () => {
    const handleDelete = jest.fn();
    render(<GameCard game={mockGame} onDelete={handleDelete} />);

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(mockGame.id);
  });

  test("does not render delete button if onDelete is not provided", () => {
    render(<GameCard game={mockGame} />);
    expect(
      screen.queryByRole("button", { name: /Delete/i })
    ).not.toBeInTheDocument();
  });
});
