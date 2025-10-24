import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateGameForm from '../CreateGameForm';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../lib/storage', () => ({
  createGame: jest.fn(() => ({ id: 'new-game' })),
}));

describe('CreateGameForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CreateGameForm />);
    expect(screen.getByLabelText(/Player Names/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(2);
    expect(screen.getByRole('button', { name: /Add Player/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('adds a new player when "Add Player" is clicked', () => {
    render(<CreateGameForm />);
    const addPlayerButton = screen.getByRole('button', { name: /Add Player/i });
    fireEvent.click(addPlayerButton);
    expect(screen.getAllByRole('textbox').length).toBe(3);
  });

  it('removes a player when "Remove" is clicked', () => {
    render(<CreateGameForm />);
    const addPlayerButton = screen.getByRole('button', { name: /Add Player/i });
    fireEvent.click(addPlayerButton);
    expect(screen.getAllByRole('textbox').length).toBe(3);

    const removeButtons = screen.getAllByRole('button', { name: /×/i });
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByRole('textbox').length).toBe(2);
  });

  it('submits the form and redirects on success', async () => {
    render(<CreateGameForm />);
    const playerInputs = screen.getAllByRole('textbox');
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const form = screen.getByRole('button', { name: /Start Game/i }).closest('form');
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/games/new-game');
  });

  it('shows an alert if player names are not filled', () => {
    window.alert = jest.fn();
    render(<CreateGameForm />);
    const form = screen.getByRole('button', { name: /Start Game/i }).closest('form');
    fireEvent.submit(form);
    expect(window.alert).toHaveBeenCalledWith('Please fill in all player names');
  });
});
