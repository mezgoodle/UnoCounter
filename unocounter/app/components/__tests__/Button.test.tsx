import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600 text-white');
    expect(button).toHaveClass('px-4 py-2 text-base');
  });

  it('renders with different variants', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-gray-200 text-gray-900');
  });

  it('renders with different sizes', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('px-6 py-3 text-lg');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50 cursor-not-allowed');
  });

  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    const button = screen.getByRole('button', { name: /clickable/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
