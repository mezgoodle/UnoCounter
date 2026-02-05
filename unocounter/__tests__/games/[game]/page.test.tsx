import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GamePage from "../../../app/games/[game]/page";
import {
  getGame,
  addRound,
  endGame,
  undoLastRound,
  addPlayer,
} from "../../../app/lib/storage";
import { useParams, useRouter } from "next/navigation";
import { Game } from "../../../app/types/game";

// Mock dependencies
jest.mock("../../../app/lib/storage");
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockedGetGame = getGame as jest.MockedFunction<typeof getGame>;
const mockedAddRound = addRound as jest.MockedFunction<typeof addRound>;
const mockedEndGame = endGame as jest.MockedFunction<typeof endGame>;
const mockedUndoLastRound = undoLastRound as jest.MockedFunction<
  typeof undoLastRound
>;
const mockedAddPlayer = addPlayer as jest.MockedFunction<typeof addPlayer>;
const mockedUseParams = useParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

const mockGame: Game = {
  id: "game-123",
  players: [
    { id: "p1", name: "Alice", totalScore: 10 },
    { id: "p2", name: "Bob", totalScore: 20 },
  ],
  createdAt: new Date("2023-01-01T12:00:00"),
  updatedAt: new Date("2023-01-01T13:00:00"),
  currentTurn: 1,
  isActive: true,
  dealerId: "p1",
  rounds: [],
};

describe("GamePage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ game: "game-123" });
    mockedUseRouter.mockReturnValue({ push: mockPush });
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  test("renders loading state initially", () => {
    mockedGetGame.mockReturnValue(null);
    render(<GamePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects if game not found", async () => {
    mockedGetGame.mockReturnValue(null);
    render(<GamePage />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Game not found");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("renders active game details", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });

  test("opens score form and submits scores", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    const updatedGame = {
      ...mockGame,
      currentTurn: 2,
      rounds: [
        {
          turnNumber: 1,
          timestamp: new Date(),
          scores: [
            { playerId: "p1", score: 5 },
            { playerId: "p2", score: 10 },
          ],
        },
      ],
      players: [
        { id: "p1", name: "Alice", totalScore: 15 },
        { id: "p2", name: "Bob", totalScore: 30 },
      ],
    };
    mockedAddRound.mockReturnValue(updatedGame);

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText("Add Round Scores"));
    expect(screen.getByText("Round 1 Scores")).toBeInTheDocument();

    // Input scores
    const inputs = screen.getAllByRole("spinbutton"); // Number inputs
    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "10" } });

    // Submit
    fireEvent.click(screen.getByText("Submit Round"));

    await waitFor(() => {
      expect(mockedAddRound).toHaveBeenCalledWith("game-123", {
        scores: [
          { playerId: "p1", score: 5 },
          { playerId: "p2", score: 10 },
        ],
      });
      // Verify updated state is displayed
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.queryByText("Round 1 Scores")).not.toBeInTheDocument(); // Form closed
    });
  });

  test("cancels score form", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText("Add Round Scores"));
    expect(screen.getByText("Round 1 Scores")).toBeInTheDocument();

    // Cancel
    const cancelButtons = screen.getAllByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]); // Click the cancel in the form

    expect(screen.queryByText("Round 1 Scores")).not.toBeInTheDocument();
  });

  test("uses calculator to update score", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText("Add Round Scores"));
    expect(screen.getByText("Round 1 Scores")).toBeInTheDocument();

    // Open calculator for first player
    const calculatorButtons = screen.getAllByText("🧮");
    fireEvent.click(calculatorButtons[0]);

    // Calculator should be visible
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();

    // perform calculation: 5 + 3 = 8
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    // Verify result in calculator display (we can't easily check display value as it's just text,
    // but we can check if Apply works with the result)

    // Apply result
    fireEvent.click(screen.getByText("Apply"));

    // Calculator should be closed
    expect(screen.queryByText("C")).not.toBeInTheDocument();

    // Input should have the value 8
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(8);
  });

  test("ends game", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    const finishedGame = { ...mockGame, isActive: false };
    mockedEndGame.mockReturnValue(finishedGame);

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText("End Game")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("End Game"));

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to end this game?",
    );
    expect(mockedEndGame).toHaveBeenCalledWith("game-123");

    await waitFor(() => {
      expect(screen.getByText("Finished")).toBeInTheDocument();
      expect(screen.queryByText("End Game")).not.toBeInTheDocument();
    });
  });

  test("renders round history", async () => {
    const gameWithHistory = {
      ...mockGame,
      rounds: [
        {
          turnNumber: 1,
          timestamp: new Date("2023-01-01T12:30:00"),
          scores: [
            { playerId: "p1", score: 5 },
            { playerId: "p2", score: 10 },
          ],
        },
      ],
    };
    mockedGetGame.mockReturnValue(gameWithHistory);

    render(<GamePage />);

    // Wait for the game to load first
    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Now check for Round History
    expect(screen.getByText("Round History")).toBeInTheDocument();
    expect(screen.getByText("Round 1")).toBeInTheDocument();
  });

  test("undoes the last round", async () => {
    // Game with one round
    const gameWithRounds = {
      ...mockGame,
      currentTurn: 2,
      rounds: [
        {
          turnNumber: 1,
          timestamp: new Date(),
          scores: [
            { playerId: "p1", score: 10 },
            { playerId: "p2", score: 20 },
          ],
        },
      ],
      players: [
        { id: "p1", name: "Alice", totalScore: 20 }, // 10 initial + 10 round
        { id: "p2", name: "Bob", totalScore: 40 }, // 20 initial + 20 round
      ],
    };

    // Result after undo (back to initial)
    const gameAfterUndo = {
      ...mockGame,
      currentTurn: 1,
      rounds: [],
      players: [
        { id: "p1", name: "Alice", totalScore: 10 },
        { id: "p2", name: "Bob", totalScore: 20 },
      ],
    };

    mockedGetGame.mockReturnValue(gameWithRounds);
    mockedUndoLastRound.mockReturnValue(gameAfterUndo);

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Undo button should be enabled
    const undoButton = screen.getByText("Undo Last Round");
    expect(undoButton).toBeEnabled();

    // Click undo
    fireEvent.click(undoButton);

    // Confirm dialog
    expect(window.confirm).toHaveBeenCalledWith("Undo the most recent round?");

    // Check storage call
    expect(mockedUndoLastRound).toHaveBeenCalledWith("game-123");

    // Check UI update
    await waitFor(() => {
      // Scores should be back to 10 and 20
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });

  test("closes calculator when cancelled", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText("Add Round Scores"));

    // Open calculator
    const calculatorButtons = screen.getAllByText("🧮");
    fireEvent.click(calculatorButtons[0]);

    // Verify calculator is open
    expect(screen.getByText("C")).toBeInTheDocument();

    // Since calculator is in a portal/overlay (fixed inset-0), it might be later in DOM.
    const cancels = screen.getAllByText("Cancel");
    fireEvent.click(cancels[cancels.length - 1]); // Assume it's the last one rendered

    // Verify calculator is closed
    expect(screen.queryByText("C")).not.toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  test("adds a new player", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    const updatedGame = {
      ...mockGame,
      players: [
        ...mockGame.players,
        { id: "p3", name: "Charlie", totalScore: 50 },
      ],
    };
    mockedAddPlayer.mockReturnValue(updatedGame);

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    // Open Add Player form
    fireEvent.click(screen.getByText("Add Player"));

    // Use placeholder for name input
    const nameInput = screen.getByPlaceholderText("Enter player name");
    fireEvent.change(nameInput, { target: { value: "Charlie" } });

    // Use spinbutton for score
    const scoreInput = screen.getByRole("spinbutton");
    fireEvent.change(scoreInput, { target: { value: "50" } });

    // Submit - the button inside the form
    // The header button text changes to "Cancel Add Player", so "Add Player" is unique now
    fireEvent.click(screen.getByRole("button", { name: "Add Player" }));

    await waitFor(() => {
      expect(mockedAddPlayer).toHaveBeenCalledWith("game-123", "Charlie", 50);
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      // Form should close
      expect(screen.queryByText("Player Name")).not.toBeInTheDocument();
    });
  });

  test("cancels add player form via header button", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add Player"));
    expect(screen.getByText("Player Name")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel Add Player"));
    expect(screen.queryByText("Player Name")).not.toBeInTheDocument();
  });

  test("cancels add player form via form button", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add Player"));
    expect(screen.getByText("Player Name")).toBeInTheDocument();

    // Click the Cancel button inside the form
    // There might be multiple "Cancel" buttons if calculator or others were involved, but here just one.
    // Actually, "Add Round Scores" button is "Cancel" when score form is open.
    // But score form is closed.
    // The "Add Player" cancel button:
    // <Button variant="secondary" onClick={() => setShowAddPlayerForm(false)}>Cancel</Button>

    const cancelButtons = screen.getAllByText("Cancel");
    // Should be just one?
    // "Add Round Scores" (when closed) -> text is "Add Round Scores".
    // So "Cancel" is unique inside the Add Player form?
    // Wait, let's check header: "Cancel Add Player" matches /Cancel/.
    // But exact text "Cancel" is usually button children.

    // Let's use getByRole("button", { name: "Cancel" })
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Player Name")).not.toBeInTheDocument();
  });

  test("verifies toggle button texts for score and player forms", async () => {
    mockedGetGame.mockReturnValue(mockGame);
    render(<GamePage />);

    await waitFor(() => {
      // Use getByRole button to ensure we find buttons
      expect(
        screen.getByRole("button", { name: "Add Round Scores" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Player" }),
      ).toBeInTheDocument();
    });

    // Toggle Score Form
    fireEvent.click(screen.getByRole("button", { name: "Add Round Scores" }));

    // Now there should be a "Cancel" button.
    // There is also a "Cancel" button in the form which appears.
    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    expect(cancelButtons.length).toBeGreaterThan(0);

    // The "Add Round Scores" button should no longer exist
    expect(
      screen.queryByRole("button", { name: "Add Round Scores" }),
    ).not.toBeInTheDocument();

    // Toggle back using the first cancelled button found
    fireEvent.click(cancelButtons[0]);

    // Should be back to "Add Round Scores"
    expect(
      screen.getByRole("button", { name: "Add Round Scores" }),
    ).toBeInTheDocument();

    // Toggle Player Form
    fireEvent.click(screen.getByRole("button", { name: "Add Player" }));

    // Header button becomes "Cancel Add Player"
    expect(
      screen.getByRole("button", { name: "Cancel Add Player" }),
    ).toBeInTheDocument();

    // "Add Player" button in header should be gone.
    // BUT "Add Player" button in form is present.
    // We want to ensure the HEADER button is toggled.
    // The Header button had "w-full md:w-auto" class if that helps, or just rely on the text change.
    // If "Cancel Add Player" is present, we know the state changed.

    // Toggle back
    fireEvent.click(screen.getByRole("button", { name: "Cancel Add Player" }));

    // "Cancel Add Player" is gone
    expect(
      screen.queryByRole("button", { name: "Cancel Add Player" }),
    ).not.toBeInTheDocument();
    // "Add Player" should be back (header button).
    expect(
      screen.getByRole("button", { name: "Add Player" }),
    ).toBeInTheDocument();
  });

  test("undo button is disabled when no rounds exist", async () => {
    const gameNoRounds = { ...mockGame, rounds: [] };
    mockedGetGame.mockReturnValue(gameNoRounds);

    render(<GamePage />);
    await waitFor(() => {
      expect(screen.getByText(/UNO Game #me-123/i)).toBeInTheDocument();
    });

    const undoButton = screen.getByRole("button", { name: "Undo Last Round" });
    expect(undoButton).toBeDisabled();
  });

  test("renders finished game state (no action buttons)", async () => {
    const finishedGame = { ...mockGame, isActive: false };
    mockedGetGame.mockReturnValue(finishedGame);

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText("Finished")).toBeInTheDocument();
    });

    // Action buttons should not be present
    expect(
      screen.queryByRole("button", { name: "Add Round Scores" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Undo Last Round" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add Player" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "End Game" }),
    ).not.toBeInTheDocument();
  });
});
