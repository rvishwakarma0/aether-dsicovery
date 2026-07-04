import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscoveryScreen from '../../components/DiscoveryScreen';
import { DestinationSuggestion } from '../../types';

// Mock motion/react to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out motion-specific props that cause React warnings
      const { initial, animate, transition, ...htmlProps } = props;
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
});

// Use destination names that don't overlap with PRESETS to avoid duplicate text
const mockDestinations: DestinationSuggestion[] = [
  { name: 'Rishikesh', hook: 'Perfect for yoga and rafting', tag: 'Popular' },
  { name: 'Ziro Valley', hook: 'Music festivals and rice paddies', tag: 'Offbeat' },
];

const defaultProps = {
  destinations: [] as DestinationSuggestion[],
  selectedDestination: null,
  onSelectDestination: vi.fn(),
  isLoading: false,
  onSearch: vi.fn(),
  errorMessage: null as string | null,
};

describe('DiscoveryScreen', () => {
  it('renders the search form with input and discover button', () => {
    const { container } = render(<DiscoveryScreen {...defaultProps} />);

    expect(container.querySelector('h2')?.textContent).toBe('Explore Destinations');
    expect(container.querySelector('#destination-search-input')).toBeTruthy();
    expect(screen.getByText('Discover')).toBeInTheDocument();
  });

  it('renders preset chip filter groups', () => {
    const { container } = render(<DiscoveryScreen {...defaultProps} />);

    const groups = container.querySelectorAll('[role="group"]');
    expect(groups.length).toBe(3);

    // Check some preset chips exist by their role
    expect(screen.getByRole('button', { name: 'Ladakh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'October' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quiet Trekking' })).toBeInTheDocument();
  });

  it('shows empty state when no destinations', () => {
    render(<DiscoveryScreen {...defaultProps} />);
    expect(screen.getByText('No destinations suggested yet')).toBeInTheDocument();
  });

  it('renders destination list when destinations are provided', () => {
    render(
      <DiscoveryScreen
        {...defaultProps}
        destinations={mockDestinations}
      />
    );

    expect(screen.getByText('Suggestions (2)')).toBeInTheDocument();
    expect(screen.getByText('Rishikesh')).toBeInTheDocument();
    expect(screen.getByText('Ziro Valley')).toBeInTheDocument();
    expect(screen.getByText('Perfect for yoga and rafting')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Offbeat')).toBeInTheDocument();
  });

  it('calls onSelectDestination when a destination card is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryScreen
        {...defaultProps}
        destinations={mockDestinations}
        onSelectDestination={onSelect}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Ziro Valley, Music festivals and rice paddies'));
    expect(onSelect).toHaveBeenCalledWith(mockDestinations[1]);
  });

  it('calls onSearch with query and chips when form is submitted', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<DiscoveryScreen {...defaultProps} onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: 'Search destinations' });
    await user.type(input, 'trekking in hills');
    await user.click(screen.getByText('Discover'));

    expect(onSearch).toHaveBeenCalledWith(
      expect.stringContaining('trekking in hills'),
      expect.any(Array)
    );
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<DiscoveryScreen {...defaultProps} isLoading={true} />);
    expect(screen.getByText('GenAI is crafting custom suggestions...')).toBeInTheDocument();
  });

  it('shows error message when errorMessage is provided', () => {
    render(
      <DiscoveryScreen
        {...defaultProps}
        errorMessage="API key not configured"
      />
    );

    expect(screen.getByText('Generation error')).toBeInTheDocument();
    expect(screen.getByText('API key not configured')).toBeInTheDocument();
  });

  it('toggles chip selection and appends prefixed text to query', async () => {
    const user = userEvent.setup();
    render(<DiscoveryScreen {...defaultProps} />);

    const octoberChip = screen.getByRole('button', { name: 'October' });
    await user.click(octoberChip);

    expect(octoberChip).toHaveAttribute('aria-pressed', 'true');

    const input = screen.getByRole('textbox', { name: 'Search destinations' }) as HTMLInputElement;
    expect(input.value).toContain('month: October');
  });

  it('removes chip text from query when deselecting', async () => {
    const user = userEvent.setup();
    render(<DiscoveryScreen {...defaultProps} />);

    const octoberChip = screen.getByRole('button', { name: 'October' });
    await user.click(octoberChip);
    expect(octoberChip).toHaveAttribute('aria-pressed', 'true');

    await user.click(octoberChip);
    expect(octoberChip).toHaveAttribute('aria-pressed', 'false');

    const input = screen.getByRole('textbox', { name: 'Search destinations' }) as HTMLInputElement;
    expect(input.value).not.toContain('month: October');
  });

  it('shows character count starting at 0', () => {
    render(<DiscoveryScreen {...defaultProps} />);
    expect(screen.getByText('0 / 250')).toBeInTheDocument();
  });

  it('highlights selected destination with aria-pressed', () => {
    render(
      <DiscoveryScreen
        {...defaultProps}
        destinations={mockDestinations}
        selectedDestination={mockDestinations[0]}
      />
    );

    const selectedBtn = screen.getByLabelText('Select Rishikesh, Perfect for yoga and rafting');
    expect(selectedBtn).toHaveAttribute('aria-pressed', 'true');

    const otherBtn = screen.getByLabelText('Select Ziro Valley, Music festivals and rice paddies');
    expect(otherBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables discover button when loading', () => {
    render(<DiscoveryScreen {...defaultProps} isLoading={true} />);

    const btn = screen.getByLabelText('Discovering destinations...');
    expect(btn).toBeDisabled();
  });

  it('supports selecting multiple chips', async () => {
    const user = userEvent.setup();
    render(<DiscoveryScreen {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Manali' }));
    await user.click(screen.getByRole('button', { name: 'October' }));

    const input = screen.getByRole('textbox', { name: 'Search destinations' }) as HTMLInputElement;
    expect(input.value).toContain('destination: Manali');
    expect(input.value).toContain('month: October');
  });
});
