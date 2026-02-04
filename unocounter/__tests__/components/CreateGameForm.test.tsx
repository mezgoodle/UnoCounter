import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateGameForm from "../../app/components/CreateGameForm";
import { createGame } from "../../app/lib/storage";
import { useRouter } from "next/navigation";
import { Game } from "@/app/types/game";

// Mock dependencies
jest.mock("../../app/lib/storage");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedCreateGame = createGame as jest.MockedFunction<typeof createGame>;
const mockedUseRouter = useRouter as jest.Mock;

describe("CreateGameForm Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush });
    window.alert = jest.fn();
  });

  test("renders the form correctly", () => {
    render(<CreateGameForm />);

    expect(
      screen.getByRole("heading", { name: /Create New UNO Game/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Player Names")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Player/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /\+ Add Player/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Game/i }),
    ).toBeInTheDocument();
  });

  test("adds a new player input when 'Add Player' is clicked", () => {
    render(<CreateGameForm />);

    const addButton = screen.getByRole("button", { name: /\+ Add Player/i });
    fireEvent.click(addButton);

    expect(screen.getAllByPlaceholderText(/Player/i)).toHaveLength(3);
  });

  test("removes a player input when remove button is clicked", () => {
    render(<CreateGameForm />);

    // Add a 3rd player first so we can remove one (min is 2)
    const addButton = screen.getByRole("button", { name: /\+ Add Player/i });
    fireEvent.click(addButton);
    expect(screen.getAllByPlaceholderText(/Player/i)).toHaveLength(3);

    // Find remove buttons (they appear when players > 2)
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    fireEvent.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText(/Player/i)).toHaveLength(2);
  });

  test("updates player names correctly", () => {
    render(<CreateGameForm />);

    const inputs = screen.getAllByPlaceholderText(/Player/i);
    fireEvent.change(inputs[0], { target: { value: "Alice" } });

    expect(inputs[0]).toHaveValue("Alice");
  });

  test("submits form with valid data", async () => {
    const mockGame = { id: "123" };
    mockedCreateGame.mockReturnValue(mockGame as Game);

    render(<CreateGameForm />);

    const inputs = screen.getAllByPlaceholderText(/Player/i);
    fireEvent.change(inputs[0], { target: { value: "Alice" } });
    fireEvent.change(inputs[1], { target: { value: "Bob" } });

    const submitButton = screen.getByRole("button", { name: /Start Game/i });
    fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(mockedCreateGame).toHaveBeenCalledWith({
        playerNames: ["Alice", "Bob"],
      });
      expect(mockPush).toHaveBeenCalledWith("/games/123");
    });
  });

  test("shows alert if player names are empty", () => {
    render(<CreateGameForm />);

    const submitButton = screen.getByRole("button", { name: /Start Game/i });
    fireEvent.submit(submitButton.closest("form")!);

    expect(window.alert).toHaveBeenCalledWith(
      "Please fill in all player names",
    );
    expect(mockedCreateGame).not.toHaveBeenCalled();
  });

  test("handles submission error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedCreateGame.mockImplementation(() => {
      throw new Error("Failed to create");
    });

    render(<CreateGameForm />);

    const inputs = screen.getAllByPlaceholderText(/Player/i);
    fireEvent.change(inputs[0], { target: { value: "Alice" } });
    fireEvent.change(inputs[1], { target: { value: "Bob" } });

    const submitButton = screen.getByRole("button", { name: /Start Game/i });
    fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Failed to create game. Please try again.",
      );
    });

    consoleSpy.mockRestore();
  });

  test("shows loading state when submitting", async () => {
    const mockGame = { id: "123" };
    mockedCreateGame.mockReturnValue(mockGame as Game);

    render(<CreateGameForm />);

    const inputs = screen.getAllByPlaceholderText(/Player/i);
    fireEvent.change(inputs[0], { target: { value: "A" } });
    fireEvent.change(inputs[1], { target: { value: "B" } });

    const submitButton = screen.getByRole("button", { name: /Start Game/i });
    fireEvent.submit(submitButton.closest("form")!);

    // Should be loading immediately
    expect(
      screen.getByRole("button", { name: /Creating Game.../i }),
    ).toBeInTheDocument();

    // Wait for completion (navigation)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/games/123");
    });
  });
});
