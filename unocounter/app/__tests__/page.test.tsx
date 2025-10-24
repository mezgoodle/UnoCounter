import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';
import { Game } from '../types/game';
import * as storage from '../lib/storage';

const mockGames: Game[] = [
  {
    id: '1',
    players: [{ id: 'p1', name: 'Alice', totalScore: 100 }],
    rounds: [],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    players: [{ id: 'p2', name: 'Bob', totalScore: 150 }],
    rounds: [],
    isActive: false,
    createdAt: new Date(),
  },
];

jest.mock('../lib/storage', () => ({
  getGames: jest.fn(() => mockGames),
  deleteGame: jest.fn(() => true),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with active and finished games', () => {
    render(<Home />);
    expect(screen.getByText(/UNO Score Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Games/i)).toBeInTheDocument();
    expect(screen.getByText(/Finished Games/i)).toBeInTheDocument();
    expect(screen.getByText(/Game #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Game #2/i)).toBeInTheDocument();
  });

  it('shows the create game form when "Start New Game" is clicked', () => {
    render(<Home />);
    const startGameButton = screen.getByRole('button', { name: /Start New Game/i });
    fireEvent.click(startGameButton);
    expect(screen.getByText(/Create New Game/i)).toBeInTheDocument();
  });

  it('deletes a game when the delete button is clicked', () => {
    window.confirm = jest.fn(() => true);
    render(<Home />);
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(storage.deleteGame).toHaveBeenCalledWith('1');
  });

  it('shows the empty state when there are no games', () => {
    (storage.getGames as jest.Mock).mockReturnValue([]);
    render(<Home />);
    expect(screen.getByText(/No games yet/i)).toBeInTheDocument();
  });
});
