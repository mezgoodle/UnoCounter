import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScoreChart from "../../app/components/ScoreChart";
import { Game } from "../../app/types/game";

const mockGameNoRounds: Game = {
  id: "game-123",
  players: [
    { id: "p1", name: "Alice", totalScore: 0 },
    { id: "p2", name: "Bob", totalScore: 0 },
  ],
  createdAt: new Date("2023-01-01T12:00:00"),
  updatedAt: new Date("2023-01-01T13:00:00"),
  currentTurn: 1,
  isActive: true,
  dealerId: "p1",
  rounds: [],
};

const mockGameWithRounds: Game = {
  id: "game-123",
  players: [
    { id: "p1", name: "Alice", totalScore: 25 }, // starts at 0, round 1: +10, round 2: +15 = 25
    { id: "p2", name: "Bob", totalScore: 35 },   // starts at 0, round 1: +20, round 2: +15 = 35
  ],
  createdAt: new Date("2023-01-01T12:00:00"),
  updatedAt: new Date("2023-01-01T13:00:00"),
  currentTurn: 3,
  isActive: true,
  dealerId: "p1",
  rounds: [
    {
      turnNumber: 1,
      timestamp: new Date("2023-01-01T12:10:00"),
      scores: [
        { playerId: "p1", score: 10 },
        { playerId: "p2", score: 20 },
      ],
    },
    {
      turnNumber: 2,
      timestamp: new Date("2023-01-01T12:20:00"),
      scores: [
        { playerId: "p1", score: 15 },
        { playerId: "p2", score: 15 },
      ],
    },
  ],
};

const mockGameWithMidGamePlayer: Game = {
  id: "game-123",
  players: [
    { id: "p1", name: "Alice", totalScore: 25 }, // starts at 0, R1: 10, R2: 15
    { id: "p2", name: "Bob", totalScore: 35 },   // starts at 0, R1: 20, R2: 15
    { id: "p3", name: "Charlie", totalScore: 40 }, // joined before R2 with start score 30, R2: 10
  ],
  createdAt: new Date("2023-01-01T12:00:00"),
  updatedAt: new Date("2023-01-01T13:00:00"),
  currentTurn: 3,
  isActive: true,
  dealerId: "p1",
  rounds: [
    {
      turnNumber: 1,
      timestamp: new Date("2023-01-01T12:10:00"),
      scores: [
        { playerId: "p1", score: 10 },
        { playerId: "p2", score: 20 },
      ],
    },
    {
      turnNumber: 2,
      timestamp: new Date("2023-01-01T12:20:00"),
      scores: [
        { playerId: "p1", score: 15 },
        { playerId: "p2", score: 15 },
        { playerId: "p3", score: 10 },
      ],
    },
  ],
};

describe("ScoreChart Component", () => {
  test("renders empty state placeholder when no rounds are played", () => {
    render(<ScoreChart game={mockGameNoRounds} />);

    expect(screen.getByText(/Play at least one round/i)).toBeInTheDocument();
    expect(screen.queryByTestId("score-progression-svg")).not.toBeInTheDocument();
  });

  test("renders legend and SVG canvas when rounds are played", () => {
    render(<ScoreChart game={mockGameWithRounds} />);

    expect(screen.getByText(/Score Progression Chart/i)).toBeInTheDocument();
    expect(screen.getByTestId("score-progression-svg")).toBeInTheDocument();
    
    // Check legend items
    const legend = screen.getByTestId("chart-legend");
    expect(legend).toHaveTextContent("Alice");
    expect(legend).toHaveTextContent("Bob");
  });

  test("renders player lines and data points", () => {
    render(<ScoreChart game={mockGameWithRounds} />);

    // Check SVG paths
    const alicePath = screen.getByTestId("player-line-p1");
    const bobPath = screen.getByTestId("player-line-p2");

    expect(alicePath).toBeInTheDocument();
    expect(bobPath).toBeInTheDocument();

    expect(alicePath).toHaveAttribute("stroke");
    expect(bobPath).toHaveAttribute("stroke");

    // Check data points group
    expect(screen.getByTestId("player-dots-p1")).toBeInTheDocument();
    expect(screen.getByTestId("player-dots-p2")).toBeInTheDocument();
  });

  test("toggles player line visibility when legend is clicked", () => {
    render(<ScoreChart game={mockGameWithRounds} />);

    const aliceLegendBtn = screen.getByRole("button", { name: /Alice/i });
    const bobLegendBtn = screen.getByRole("button", { name: /Bob/i });

    // Both lines visible initially
    expect(screen.getByTestId("player-line-p1")).toBeInTheDocument();
    expect(screen.getByTestId("player-line-p2")).toBeInTheDocument();

    // Click Alice legend to hide
    fireEvent.click(aliceLegendBtn);
    expect(screen.queryByTestId("player-line-p1")).not.toBeInTheDocument();
    expect(screen.getByTestId("player-line-p2")).toBeInTheDocument();

    // Click Bob legend to hide too
    fireEvent.click(bobLegendBtn);
    expect(screen.queryByTestId("player-line-p1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-line-p2")).not.toBeInTheDocument();
    expect(screen.getByText(/Select at least one player/i)).toBeInTheDocument();

    // Click Alice legend to show again
    fireEvent.click(aliceLegendBtn);
    expect(screen.getByTestId("player-line-p1")).toBeInTheDocument();
    expect(screen.queryByTestId("player-line-p2")).not.toBeInTheDocument();
  });

  test("handles player added mid-game correctly", () => {
    render(<ScoreChart game={mockGameWithMidGamePlayer} />);

    // All player lines should render
    expect(screen.getByTestId("player-line-p1")).toBeInTheDocument();
    expect(screen.getByTestId("player-line-p2")).toBeInTheDocument();
    expect(screen.getByTestId("player-line-p3")).toBeInTheDocument();
    
    // Check legend has Charlie
    expect(screen.getByTestId("chart-legend")).toHaveTextContent("Charlie");
  });

  test("shows and hides tooltip on mouse interaction", () => {
    render(<ScoreChart game={mockGameWithRounds} />);

    const svg = screen.getByTestId("score-progression-svg");
    
    // Tooltip should not be visible initially
    expect(screen.queryByTestId("chart-tooltip")).not.toBeInTheDocument();

    // Mock getBoundingClientRect for SVG to make coordinates math work
    svg.getBoundingClientRect = jest.fn(() => ({
      width: 600,
      height: 350,
      top: 0,
      left: 0,
      bottom: 350,
      right: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Hover over the center of the chart
    // plotWidth = 600 - 50 - 30 = 520. paddingLeft = 50.
    // N = 2.
    // X = 50 + (1 / 2) * 520 = 310 (represents Round 1)
    fireEvent.mouseMove(svg, {
      clientX: 310,
      clientY: 175,
    });

    // Tooltip should now be visible
    const tooltip = screen.getByTestId("chart-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Round 1");
    expect(tooltip).toHaveTextContent("Alice");
    expect(tooltip).toHaveTextContent("Bob");
    
    // Check Alice score at round 1: 10 (+10)
    expect(tooltip).toHaveTextContent("10");
    // Check Bob score at round 1: 20 (+20)
    expect(tooltip).toHaveTextContent("20");

    // Move mouse out
    fireEvent.mouseLeave(svg);
    expect(screen.queryByTestId("chart-tooltip")).not.toBeInTheDocument();
  });
});
