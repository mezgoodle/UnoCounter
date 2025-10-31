import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamePage from '../page';
import * as storage from '../../../lib/storage';
import { Game } from '../../../types/game';

const mockGame: Game = {
  id: '123',
  players: [
    { id: 'p1', name: 'Alice', totalScore: 100 },
    { id: 'p2', name: 'Bob', totalScore: 150 },
  ],
  rounds: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  currentTurn: 1,
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ game: '123' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../../lib/storage', () => ({
  getGame: jest.fn(() => mockGame),
  addRound: jest.fn((gameId, data) => ({
    ...mockGame,
    rounds: [{ turnNumber: 1, scores: data.scores, timestamp: new Date() }],
  })),
  endGame: jest.fn(() => ({ ...mockGame, isActive: false })),
}));

describe('GamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the game page with game data', () => {
    render(<GamePage />);
    expect(screen.getByText(/UNO Game #123/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob/i)).toBeInTheDocument();
  });

  it('shows the score form when "Add Round Scores" is clicked', () => {
    render(<GamePage />);
    const addRoundButton = screen.getByRole('button', { name: /Add Round Scores/i });
    fireEvent.click(addRoundButton);
    expect(screen.getByText(/Round 1 Scores/i)).toBeInTheDocument();
  });

  it('submits a round and updates the game state', () => {
    render(<GamePage />);
    const addRoundButton = screen.getByRole('button', { name: /Add Round Scores/i });
    fireEvent.click(addRoundButton);

    const scoreInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(scoreInputs[0], { target: { value: '50' } });

    const submitButton = screen.getByRole('button', { name: /Submit Round/i });
    fireEvent.click(submitButton);

    expect(storage.addRound).toHaveBeenCalled();
    expect(screen.queryByText(/Round 1 Scores/i)).not.toBeInTheDocument();
  });

  it('ends the game when "End Game" is clicked', () => {
    window.confirm = jest.fn(() => true);
    render(<GamePage />);
    const endGameButton = screen.getByRole('button', { name: /End Game/i });
    fireEvent.click(endGameButton);
    expect(storage.endGame).toHaveBeenCalledWith('123');
  });

  it('shows a "Game not found" message if the game does not exist', () => {
    (storage.getGame as jest.Mock).mockReturnValue(null);
    render(<GamePage />);
    expect(screen.getByText(/Game not found/i)).toBeInTheDocument();
  });
});
