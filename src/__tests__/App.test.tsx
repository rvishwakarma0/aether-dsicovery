import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import App from '../App';

// Mock the child components to isolate App logic
vi.mock('../components/DiscoveryScreen', () => ({
  default: (props: any) => (
    <div data-testid="discovery-screen">
      <button
        data-testid="trigger-search"
        onClick={() => props.onSearch('test query', ['Manali'])}
      >
        Search
      </button>
      <button
        data-testid="select-dest"
        onClick={() =>
          props.onSelectDestination({
            name: 'Manali',
            hook: 'Great for trekking',
            tag: 'Popular',
          })
        }
      >
        Select
      </button>
      {props.isLoading && <span data-testid="discover-loading">Loading...</span>}
      {props.errorMessage && (
        <span data-testid="discover-error">{props.errorMessage}</span>
      )}
      <span data-testid="dest-count">{props.destinations.length}</span>
    </div>
  ),
}));

vi.mock('../components/DestinationDetail', () => ({
  default: (props: any) => (
    <div data-testid="destination-detail">
      <span data-testid="active-tab">{props.activeTab}</span>
      <span data-testid="detail-loading">
        {props.isLoading ? 'true' : 'false'}
      </span>
      <span data-testid="dest-name">
        {props.destination?.name || 'none'}
      </span>
      <button
        data-testid="change-tab"
        onClick={() => props.setActiveTab('heritage')}
      >
        Change Tab
      </button>
      <button
        data-testid="refine-tab"
        onClick={() => props.onRefineTab('stories', 'more history')}
      >
        Refine
      </button>
    </div>
  ),
}));

vi.mock('../components/GlobalChat', () => ({
  default: (props: any) => (
    <div data-testid="global-chat">
      <span data-testid="chat-generating">
        {props.isGenerating ? 'true' : 'false'}
      </span>
      <span data-testid="chat-history-count">{props.chatHistory.length}</span>
      <button
        data-testid="send-chat"
        onClick={() => props.onSendMessage('hello')}
      >
        Send
      </button>
    </div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the app with header and all child components', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    expect(within(appRoot).getByText('AETHER')).toBeInTheDocument();
    expect(within(appRoot).getByText('DISCOVERY')).toBeInTheDocument();
    expect(within(appRoot).getByTestId('discovery-screen')).toBeInTheDocument();
    expect(within(appRoot).getByTestId('destination-detail')).toBeInTheDocument();
    expect(within(appRoot).getByTestId('global-chat')).toBeInTheDocument();
  });

  it('renders the skip-to-content accessibility link', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;
    const link = appRoot.querySelector('a[href="#main-content-layout"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Skip to content');
  });

  it('starts with no destinations and stories tab active', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    expect(within(appRoot).getByTestId('dest-count').textContent).toBe('0');
    expect(within(appRoot).getByTestId('active-tab').textContent).toBe('stories');
    expect(within(appRoot).getByTestId('dest-name').textContent).toBe('none');
  });

  it('calls fetch on discover and updates destinations on success', async () => {
    const mockDestinations = [
      { name: 'Manali', hook: 'Great trekking', tag: 'Popular' },
      { name: 'Coorg', hook: 'Coffee plantations', tag: 'Offbeat' },
    ];

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ destinations: mockDestinations }),
      })
      // Tab content fetch triggered by auto-selecting first destination
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'test', suggestions: [] }),
      });

    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('trigger-search'));

    await waitFor(() => {
      expect(within(appRoot).getByTestId('dest-count').textContent).toBe('2');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/discover', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('shows error when discover API fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('trigger-search'));

    await waitFor(() => {
      expect(within(appRoot).getByTestId('discover-error')).toBeInTheDocument();
    });
  });

  it('sends a global chat message and appends to history', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'Hello traveler!',
        intent: 'q_and_a',
      }),
    });

    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('send-chat'));

    // User message + model reply
    await waitFor(() => {
      expect(within(appRoot).getByTestId('chat-history-count').textContent).toBe('2');
    });
  });

  it('handles chat API failure gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('send-chat'));

    await waitFor(() => {
      // User message + error message
      expect(within(appRoot).getByTestId('chat-history-count').textContent).toBe('2');
    });
  });

  it('updates destinations when chat returns refine_list intent', async () => {
    const initialDests = [
      { name: 'Manali', hook: 'Great trekking', tag: 'Popular' },
    ];
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ destinations: initialDests }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'test', suggestions: [] }),
      });

    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('trigger-search'));

    await waitFor(() => {
      expect(within(appRoot).getByTestId('dest-count').textContent).toBe('1');
    });

    // Chat that refines the list
    const newDests = [
      { name: 'Ladakh', hook: 'Adventure awaits', tag: 'Offbeat' },
      { name: 'Spiti', hook: 'Remote beauty', tag: 'Offbeat' },
    ];
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Updated your list!',
          intent: 'refine_list',
          updatedDestinations: newDests,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'new content', suggestions: [] }),
      });

    fireEvent.click(within(appRoot).getByTestId('send-chat'));

    await waitFor(() => {
      expect(within(appRoot).getByTestId('dest-count').textContent).toBe('2');
    });
  });

  it('changes active tab when setActiveTab is called', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('#app-root')!;

    fireEvent.click(within(appRoot).getByTestId('change-tab'));
    expect(within(appRoot).getByTestId('active-tab').textContent).toBe('heritage');
  });
});
