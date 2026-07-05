/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fetch globally
globalThis.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    (globalThis.fetch as any).mockResolvedValueOnce(new Promise(() => { })); // pending promise
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders map after successful fetch', async () => {
    const mockMapData = {
      layout: [
        '....................',
        '.W.................'
      ],
      bookedCabanas: []
    };

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapData,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Resort Oasis/i)).toBeInTheDocument();
    });

    // Check if cabana is rendered
    const cabanaImg = screen.getByAltText('W');
    expect(cabanaImg).toBeInTheDocument();
  });

  it('opens booking modal when cabana is clicked', async () => {
    const mockMapData = {
      layout: ['.W.'],
      bookedCabanas: []
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockMapData,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByAltText('W')).toBeInTheDocument();
    });

    // Click on the cabana container
    const cabanaImg = screen.getByAltText('W');
    fireEvent.click(cabanaImg.parentElement!); // click the wrapper div

    expect(screen.getByText(/Book Cabana/i)).toBeInTheDocument();
  });
});
