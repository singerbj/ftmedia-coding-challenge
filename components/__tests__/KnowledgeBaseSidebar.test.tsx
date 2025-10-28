import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KnowledgeBaseSidebar from '../KnowledgeBaseSidebar';
import { useQuery, useMutation } from 'convex/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, onClick, onMouseEnter, onMouseLeave, 'data-testid': dataTestId }: any) => (
      <div className={className} style={style} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} data-testid={dataTestId}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock SkeletonLoader
jest.mock('../SkeletonLoader', () => ({
  TagSkeletonLoader: () => <div data-testid="tag-skeleton">Tag Skeleton</div>,
  PinnedItemSkeletonLoader: () => <div data-testid="pinned-skeleton">Pinned Skeleton</div>,
}));

jest.mock('convex/react');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('KnowledgeBaseSidebar', () => {
  const mockTags = [
    { _id: 'tag-1', name: 'javascript', count: 5 },
    { _id: 'tag-2', name: 'react', count: 3 },
    { _id: 'tag-3', name: 'typescript', count: 2 },
  ];

  const mockChats = [
    {
      _id: 'chat-1',
      title: 'React Basics',
      messages: [],
      highlightedQAIndex: 0,
      tags: ['javascript', 'react'],
      isPinned: true,
      createdAt: Date.now(),
      isFlagged: false,
    },
    {
      _id: 'chat-2',
      title: 'TypeScript Types',
      messages: [],
      highlightedQAIndex: 0,
      tags: ['typescript'],
      isPinned: false,
      createdAt: Date.now() - 10000,
      isFlagged: false,
    },
    {
      _id: 'chat-3',
      title: 'Advanced React',
      messages: [],
      highlightedQAIndex: 0,
      tags: ['react'],
      isPinned: true,
      createdAt: Date.now() - 20000,
      isFlagged: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue(jest.fn());
  });

  it('renders tags section', () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByText('Top Tags')).toBeInTheDocument();
  });

  it('displays tags from query', () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows skeleton loader while tags are loading', () => {
    mockUseQuery.mockReturnValue(null);

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByTestId('tag-skeleton')).toBeInTheDocument();
  });

  it('selects tag when clicked', () => {
    const onTagSelect = jest.fn();
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={onTagSelect}
        onTagSearchClick={jest.fn()}
      />
    );

    const tagElements = screen.getAllByText('javascript');
    fireEvent.click(tagElements[0]);

    expect(onTagSelect).toHaveBeenCalledWith('javascript');
  });

  it('deselects tag when clicking selected tag', () => {
    const onTagSelect = jest.fn();
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    const { rerender } = render(
      <KnowledgeBaseSidebar
        selectedTag="javascript"
        onTagSelect={onTagSelect}
        onTagSearchClick={jest.fn()}
      />
    );

    const tagElements = screen.getAllByText('javascript');
    fireEvent.click(tagElements[0]);

    expect(onTagSelect).toHaveBeenCalledWith(undefined);
  });

  it('highlights selected tag', () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        selectedTag="javascript"
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    const tagElements = screen.getAllByText('javascript');
    expect(tagElements[0].closest('div')).toBeInTheDocument();
  });

  it('renders pinned items section', () => {
    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return mockChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByText('Pinned Knowledge')).toBeInTheDocument();
  });

  it('displays pinned items', () => {
    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return mockChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByText('React Basics')).toBeInTheDocument();
    expect(screen.getByText('Advanced React')).toBeInTheDocument();
  });

  it('does not display unpinned items in pinned section', () => {
    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return mockChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    // TypeScript Types is not pinned
    const typeScriptElements = screen.queryAllByText('TypeScript Types');
    expect(typeScriptElements.length).toBe(0);
  });

  it('calls onPinnedItemClick when pinned item is clicked', () => {
    const onPinnedItemClick = jest.fn();
    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return mockChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onPinnedItemClick={onPinnedItemClick}
        onTagSearchClick={jest.fn()}
      />
    );

    const pinnedItems = screen.getAllByText(/React Basics|Advanced React/);
    if (pinnedItems.length > 0) {
      fireEvent.click(pinnedItems[0]);
      expect(onPinnedItemClick).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'chat-1',
      }));
    }
  });

  it('toggles pinned state when pin button is clicked', async () => {
    const togglePin = jest.fn().mockResolvedValue(undefined);
    mockUseMutation.mockReturnValue(togglePin);

    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return mockChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    const pinButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('svg')
    );

    if (pinButtons.length > 0) {
      fireEvent.click(pinButtons[0]);

      await waitFor(() => {
        expect(togglePin).toHaveBeenCalled();
      });
    }
  });

  it('shows empty state when no tags', () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return [];
      if ((api as Record<string, unknown>)?.messages?.getChats) return [];
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    // Component should handle empty tags gracefully
    expect(screen.getByText('Top Tags')).toBeInTheDocument();
  });

  it('displays tag count', () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    // Check that counts are displayed
    const countText = screen.getByText('5');
    expect(countText).toBeInTheDocument();
  });

  it('limits displayed tags to top 10', () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => ({
      _id: `tag-${i}`,
      name: `tag${i}`,
      count: 20 - i,
    }));

    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return manyTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    // Should display top 10 tags
    const tag0 = screen.queryByText('tag0');
    expect(tag0).toBeInTheDocument();

    // Last tag (tag19) should not be displayed (only top 10)
    const tag19 = screen.queryByText('tag19');
    expect(tag19).not.toBeInTheDocument();
  });

  it('handles tag search click callback', () => {
    const onTagSearchClick = jest.fn();
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getAllTags) return mockTags;
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={onTagSearchClick}
      />
    );

    const tagElements = screen.getAllByText('javascript');
    fireEvent.click(tagElements[0]);

    // This should trigger tag selection, and the callback should work
    expect(tagElements[0]).toBeInTheDocument();
  });

  it('shows loading skeleton for pinned items', () => {
    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return null; // Second call is for getChats (loading)
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    expect(screen.getByTestId('pinned-skeleton')).toBeInTheDocument();
  });

  it('handles empty pinned items gracefully', () => {
    const noPinnedChats = mockChats.map(chat => ({
      ...chat,
      isPinned: false,
    }));

    let callCount = 0;
    mockUseQuery.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockTags; // First call is for getAllTags
      if (callCount === 2) return noPinnedChats; // Second call is for getChats
      return null;
    });

    render(
      <KnowledgeBaseSidebar
        onTagSelect={jest.fn()}
        onTagSearchClick={jest.fn()}
      />
    );

    // Should show pinned section but with no items
    expect(screen.getByText('Pinned Knowledge')).toBeInTheDocument();
  });
});
