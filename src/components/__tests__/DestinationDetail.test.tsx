import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DestinationDetail from '../../components/DestinationDetail';
import { DestinationSuggestion, TabType, TabContent } from '../../types';

// Mock react-markdown to avoid ESM issues in test env
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>,
}));

afterEach(() => {
  cleanup();
});

const mockDestination: DestinationSuggestion = {
  name: 'Manali',
  hook: 'Perfect for winter trekking',
  tag: 'Popular',
};

const emptyTabContents: Record<TabType, TabContent | null> = {
  stories: null,
  heritage: null,
  hidden_gems: null,
  local_events: null,
};

const populatedTabContents: Record<TabType, TabContent | null> = {
  stories: {
    content: '# Stories of Manali\n\nA beautiful tale...',
    suggestions: ['Photography spots', 'Local cuisine', 'Best season'],
  },
  heritage: null,
  hidden_gems: null,
  local_events: null,
};

const defaultProps = {
  destination: null as DestinationSuggestion | null,
  activeTab: 'stories' as TabType,
  setActiveTab: vi.fn(),
  tabContents: emptyTabContents,
  isLoading: false,
  onRefineTab: vi.fn(),
};

describe('DestinationDetail', () => {
  it('shows empty state when no destination is selected', () => {
    render(<DestinationDetail {...defaultProps} />);

    expect(screen.getByText('No Destination Selected')).toBeInTheDocument();
    expect(
      screen.getByText(/Select any of the curated destinations/)
    ).toBeInTheDocument();
  });

  it('renders destination name and tag when a destination is selected', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
      />
    );

    expect(screen.getByText('Manali')).toBeInTheDocument();
    expect(screen.getByText('Curated Hotspot')).toBeInTheDocument();
  });

  it('shows "Undiscovered Territory" label for Offbeat destinations', () => {
    const offbeat: DestinationSuggestion = {
      name: 'Spiti',
      hook: 'Remote valleys',
      tag: 'Offbeat',
    };
    render(
      <DestinationDetail
        {...defaultProps}
        destination={offbeat}
      />
    );

    expect(screen.getByText('Undiscovered Territory')).toBeInTheDocument();
  });

  it('renders all four tab buttons', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
      />
    );

    const tabList = screen.getByRole('tablist');
    const tabs = within(tabList).getAllByRole('tab');
    expect(tabs).toHaveLength(4);

    expect(tabs[0]).toHaveTextContent('Stories');
    expect(tabs[1]).toHaveTextContent('Heritage');
    expect(tabs[2]).toHaveTextContent('Hidden Gems');
    expect(tabs[3]).toHaveTextContent('Events & Culture');
  });

  it('highlights the active tab', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        activeTab="stories"
      />
    );

    const tabs = screen.getAllByRole('tab');
    const storiesTab = tabs.find(t => t.textContent?.includes('Stories'));
    const heritageTab = tabs.find(t => t.textContent?.includes('Heritage'));

    expect(storiesTab).toHaveAttribute('aria-selected', 'true');
    expect(heritageTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls setActiveTab when a tab is clicked', () => {
    const setActiveTab = vi.fn();
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        setActiveTab={setActiveTab}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const heritageTab = tabs.find(t => t.textContent?.includes('Heritage'))!;
    fireEvent.click(heritageTab);
    expect(setActiveTab).toHaveBeenCalledWith('heritage');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        isLoading={true}
      />
    );

    expect(screen.getByText('Weaving immersive stories...')).toBeInTheDocument();
  });

  it('renders markdown content when tab content is loaded', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    expect(
      screen.getByTestId('markdown-content').textContent
    ).toContain('Stories of Manali');
  });

  it('renders refinement suggestion chips', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
      />
    );

    expect(screen.getByText('Refinement Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Photography spots')).toBeInTheDocument();
    expect(screen.getByText('Local cuisine')).toBeInTheDocument();
    expect(screen.getByText('Best season')).toBeInTheDocument();
  });

  it('calls onRefineTab when a suggestion chip is clicked', () => {
    const onRefineTab = vi.fn();
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
        onRefineTab={onRefineTab}
      />
    );

    fireEvent.click(screen.getByText('Photography spots'));
    expect(onRefineTab).toHaveBeenCalledWith('stories', 'Photography spots');
  });

  it('calls onRefineTab when submitting the refine input form', async () => {
    const user = userEvent.setup();
    const onRefineTab = vi.fn();
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
        onRefineTab={onRefineTab}
      />
    );

    const input = screen.getByPlaceholderText('e.g. More historical details...');
    await user.type(input, 'More historical details');
    await user.click(screen.getByLabelText('Submit refinement'));

    expect(onRefineTab).toHaveBeenCalledWith('stories', 'More historical details');
  });

  it('does not submit refinement when input is empty', () => {
    const onRefineTab = vi.fn();
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
        onRefineTab={onRefineTab}
      />
    );

    const submitBtn = screen.getByLabelText('Submit refinement');
    expect(submitBtn).toBeDisabled();
  });

  it('clears refine input after submission', async () => {
    const user = userEvent.setup();
    const onRefineTab = vi.fn();
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
        onRefineTab={onRefineTab}
      />
    );

    const input = screen.getByPlaceholderText('e.g. More historical details...') as HTMLInputElement;
    await user.type(input, 'More details');
    await user.click(screen.getByLabelText('Submit refinement'));

    expect(input.value).toBe('');
  });

  it('shows "Start discovery" message when tab content is null', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={emptyTabContents}
      />
    );

    expect(screen.getByText('Start discovery')).toBeInTheDocument();
  });

  it('renders Cultural Spotlight sidebar when content is present', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
        tabContents={populatedTabContents}
      />
    );

    expect(screen.getByText('Cultural Spotlight')).toBeInTheDocument();
    expect(screen.getByText('Authentic Explorations')).toBeInTheDocument();
  });

  it('displays destination type in the header', () => {
    render(
      <DestinationDetail
        {...defaultProps}
        destination={mockDestination}
      />
    );

    expect(screen.getByText('Popular')).toBeInTheDocument();
  });
});
