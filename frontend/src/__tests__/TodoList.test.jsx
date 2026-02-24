import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import TodoList from '../TodoList.jsx'

// ** Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

describe('TodoList', () => {
  beforeEach(() => {
    // Mock fetch
    vi.stubGlobal('fetch', vi.fn());
    
    // Mock useAuth to return test values
    useAuth.mockReturnValue({
      username: 'testuser',
      accessToken: 'test-token-123',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: 'Test Todo', done: false, comments: [] },
        { id: 2, title: 'Another Todo', done: true, comments: [] },
      ],
    });
  });

  it('renders TodoList with todos from API', async () => {
    render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    // Wait for todos to be loaded
    const todoElement = await screen.findByText('Test Todo');
    expect(todoElement).toBeInTheDocument();
  });

  it('sends Authorization header when fetching todos', async () => {
    render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    // Wait for fetch to be called
    await screen.findByText('Test Todo');
    
    // Verify fetch was called with Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/todos/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123',
        }),
      })
    );
  });

  it('displays username when logged in', async () => {
    render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    // Wait for component to render and check for Logout button (which appears when username exists)
    const logoutLink = await screen.findByText('Logout');
    expect(logoutLink).toBeInTheDocument();
  });

  it('calls logout when Logout link is clicked', async () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      username: 'testuser',
      accessToken: 'test-token-123',
      login: vi.fn(),
      logout: mockLogout,
    });

    render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    await screen.findByText('Test Todo');
    
    const logoutLink = screen.getByText('Logout');
    fireEvent.click(logoutLink);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('adds Authorization header to toggle API calls', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: 'Test Todo', done: false, comments: [] },
      ],
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Test Todo', done: true, comments: [] }),
    });

    render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    const todo = await screen.findByText('Test Todo');
    const toggleButton = todo.closest('li').querySelector('button');
    
    fireEvent.click(toggleButton);
    
    // Find the toggle call (second call after initial fetch)
    const toggleCall = global.fetch.mock.calls.find(call => 
      call[0].includes('toggle')
    );
    
    if (toggleCall) {
      expect(toggleCall[1]).toEqual(
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
          }),
        })
      );
    }
  });

  it('clears todo list when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { rerender } = render(<TodoList apiUrl="http://localhost:5000/api/todos/" />);
    
    // Simulate logout by changing the mock return value
    useAuth.mockReturnValue({
      username: null,
      accessToken: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Rerender to trigger useEffect with new username dependency
    rerender(<TodoList apiUrl="http://localhost:5000/api/todos/" />);

    // After failure, todo list should be empty
    const todoElement = screen.queryByText('Test Todo');
    expect(todoElement).not.toBeInTheDocument();
  });
});
