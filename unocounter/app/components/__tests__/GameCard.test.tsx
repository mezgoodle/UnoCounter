import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import GameCard from '../GameCard';
import { Game } from '../../types/game';

const mockGame: Game = {
  id: '123',
  players: [
    { id: 'p1', name: 'Alice', totalScore: 100 },
    { id: 'p2', name: 'Bob', totalScore: 150 },
  ],
  rounds: [],
  isActive: true,
  createdAt: new Date(),
};

const mockFinishedGame: Game = {
  ...mockGame,
  isActive: false,
};

describe('GameCard component', () => {
  it('renders active game correctly', () => {
    render(<GameCard game={mockGame} />);
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob/i)).toBeInTheDocument();
    expect(screen.getByText(/150/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue Game/i })).toHaveAttribute('href', '/games/123');
  });

  it('renders finished game correctly', () => {
    render(<GameCard game={mockFinishedGame} />);
    expect(screen.getByText(/Finished/i)).toBeInTheDocument();
    const winnerContainer = screen.getByTestId('winner-container');
    expect(winnerContainer).toHaveTextContent('🏆 Winner: Alice (100 points)');
    expect(screen.getByRole('link', { name: /View Game/i })).toHaveAttribute('href', '/games/123');
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    render(<GameCard game={mockGame} onDelete={handleDelete} />);
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith('123');
  });
});
