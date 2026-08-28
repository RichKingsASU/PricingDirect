import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App & Development Bypass Screen', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders login page with Development Bypass screen by default', () => {
    render(<App />);
    expect(screen.getByText(/Development Bypass Screen/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Dev Bypass/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Test Persona & Role/i)).toBeInTheDocument();
  });

  it('enters dashboard when Instant Dev Bypass button is clicked', () => {
    render(<App />);
    const bypassButton = screen.getByRole('button', { name: /Instant Dev Bypass/i });
    fireEvent.click(bypassButton);

    // Should now be on the main application dashboard
    expect(screen.getAllByText(/Target Control Tower/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Forrest Logistics/i).length).toBeGreaterThan(0);
  });

  it('supports launching directly into selected destination tab', () => {
    render(<App />);
    // Select Rate Directory destination tab
    const rateDirBtn = screen.getByRole('button', { name: /Rate Directory/i });
    fireEvent.click(rateDirBtn);

    const instantBtn = screen.getByRole('button', { name: /Instant Dev Bypass/i });
    fireEvent.click(instantBtn);

    // Should open Rate Directory tab
    expect(screen.getByPlaceholderText(/Search customer, origin, destination/i)).toBeInTheDocument();
  });

  it('allows switching between Dev Bypass and Supabase login forms', () => {
    render(<App />);
    const supabaseTabBtn = screen.getByRole('button', { name: /Standard Supabase Login/i });
    fireEvent.click(supabaseTabBtn);

    expect(screen.getByText(/Sign In with Supabase Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();

    const devTabBtn = screen.getByRole('button', { name: /Development Bypass Screen/i });
    fireEvent.click(devTabBtn);

    expect(screen.getByText(/Select Test Persona & Role/i)).toBeInTheDocument();
  });

  it('allows signing out to return to login screen', () => {
    render(<App />);
    const instantBtn = screen.getByRole('button', { name: /Instant Dev Bypass/i });
    fireEvent.click(instantBtn);

    // Click on User Profile Avatar to open menu
    const avatarBtn = screen.getByTitle(/User Profile & Development Settings/i);
    fireEvent.click(avatarBtn);

    // Click Sign Out
    const signOutBtn = screen.getByRole('button', { name: /Sign Out & Return to Login/i });
    fireEvent.click(signOutBtn);

    // Should be back on the Login / Dev Bypass screen
    expect(screen.getByText(/Development Bypass Screen/i)).toBeInTheDocument();
  });
});



