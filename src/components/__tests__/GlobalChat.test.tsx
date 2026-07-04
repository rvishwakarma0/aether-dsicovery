import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalChat from '../../components/GlobalChat';
import { ChatMessage, DestinationSuggestion } from '../../types';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-msg">{children}</div>,
}));

afterEach(() => {
  cleanup();
});

const mockDestination: DestinationSuggestion = {
  name: 'Manali',
  hook: 'Perfect for winter trekking',
  tag: 'Popular',
};

const defaultProps = {
  chatHistory: [] as ChatMessage[],
  onSendMessage: vi.fn(),
  selectedDestination: null as DestinationSuggestion | null,
  activeTab: 'stories',
  isGenerating: false,
};

describe('GlobalChat', () => {
  it('renders the chat header bar with AI Travel Assistant title', () => {
    render(<GlobalChat {...defaultProps} />);

    expect(screen.getByText('AI Travel Assistant')).toBeInTheDocument();
  });

  it('shows dashboard context when no destination selected', () => {
    render(<GlobalChat {...defaultProps} />);

    expect(
      screen.getByText('Aware of your current discovery dashboard')
    ).toBeInTheDocument();
  });

  it('shows destination name when destination is selected', () => {
    render(
      <GlobalChat
        {...defaultProps}
        selectedDestination={mockDestination}
        activeTab="heritage"
      />
    );

    expect(screen.getByText('Manali')).toBeInTheDocument();
  });

  it('toggles open/close when header is clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalChat {...defaultProps} />);

    const headerBtn = screen.getByLabelText('Expand AI Travel Assistant');
    await user.click(headerBtn);

    // After opening, collapse label should exist
    expect(screen.getByLabelText('Collapse AI Travel Assistant')).toBeInTheDocument();
    // Input should be visible
    expect(screen.getByPlaceholderText(/Ask a question/)).toBeInTheDocument();
  });

  it('shows empty state message when chat history is empty and expanded', async () => {
    const user = userEvent.setup();
    render(<GlobalChat {...defaultProps} />);

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    expect(screen.getByText('Persistent Travel Companion')).toBeInTheDocument();
  });

  it('renders user and model chat messages when expanded', async () => {
    const user = userEvent.setup();
    const chatHistory: ChatMessage[] = [
      { role: 'user', text: 'Tell me about Manali' },
      { role: 'model', text: 'Manali is a beautiful hill station...' },
    ];

    render(
      <GlobalChat {...defaultProps} chatHistory={chatHistory} />
    );

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    expect(screen.getByText('Tell me about Manali')).toBeInTheDocument();
    expect(screen.getByText('Manali is a beautiful hill station...')).toBeInTheDocument();
  });

  it('calls onSendMessage and clears input on submit', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(
      <GlobalChat {...defaultProps} onSendMessage={onSendMessage} />
    );

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    const input = screen.getByPlaceholderText(/Ask a question/) as HTMLInputElement;
    await user.type(input, 'Best time to visit?');
    await user.click(screen.getByLabelText('Send message'));

    expect(onSendMessage).toHaveBeenCalledWith('Best time to visit?');
    expect(input.value).toBe('');
  });

  it('disables send button when input is empty', async () => {
    const user = userEvent.setup();
    render(<GlobalChat {...defaultProps} />);

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('disables send button when isGenerating is true', async () => {
    const user = userEvent.setup();
    render(
      <GlobalChat {...defaultProps} isGenerating={true} />
    );

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('shows generating indicator when isGenerating is true', async () => {
    const user = userEvent.setup();
    render(
      <GlobalChat {...defaultProps} isGenerating={true} />
    );

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    expect(
      screen.getByText(/Generating responses/)
    ).toBeInTheDocument();
  });

  it('renders screen reader labels for user and model messages', async () => {
    const user = userEvent.setup();
    const chatHistory: ChatMessage[] = [
      { role: 'user', text: 'User message' },
      { role: 'model', text: 'Model reply' },
    ];

    render(
      <GlobalChat {...defaultProps} chatHistory={chatHistory} />
    );

    await user.click(screen.getByLabelText('Expand AI Travel Assistant'));

    expect(screen.getByText('You said:')).toBeInTheDocument();
    expect(screen.getByText('Assistant said:')).toBeInTheDocument();
  });

  it('has aria-expanded attribute on the header button', () => {
    render(<GlobalChat {...defaultProps} />);

    const headerBtn = screen.getByLabelText('Expand AI Travel Assistant');
    expect(headerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true when chat is open', async () => {
    const user = userEvent.setup();
    render(<GlobalChat {...defaultProps} />);

    const headerBtn = screen.getByLabelText('Expand AI Travel Assistant');
    await user.click(headerBtn);

    const collapseBtn = screen.getByLabelText('Collapse AI Travel Assistant');
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');
  });
});
