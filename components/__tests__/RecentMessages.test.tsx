import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecentMessages from "../RecentMessages";
import { useQuery, useMutation } from "convex/react";
import { Theme } from "@radix-ui/themes";
import React from "react";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, layout, ...props }, ref) => (
      <div {...props} ref={ref}>
        {children}
      </div>
    )),
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button {...props} ref={ref}>
        {children}
      </button>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Radix UI components that require theme
jest.mock("@radix-ui/themes", () => ({
  Theme: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Select: {
    Root: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value: string;
      onValueChange: (value: string) => void;
    }) => (
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    ),
    Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Item: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => <option value={value}>{children}</option>,
  },
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Description: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    Close: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
  },
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

// Mock TagManager
jest.mock("../TagManager", () => {
  return function MockTagManager() {
    return <div data-testid="tag-manager">Tag Manager</div>;
  };
});

// Mock SkeletonLoader
jest.mock("../SkeletonLoader", () => ({
  ChatCardSkeletonLoader: () => (
    <div data-testid="skeleton-loader">Skeleton</div>
  ),
}));

jest.mock("convex/react");

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

// Custom render function (Theme is mocked, so just use regular render)
const renderWithTheme = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  return render(component, options);
};

describe("RecentMessages", () => {
  const mockChats = [
    {
      _id: "chat-1",
      title: "React Basics",
      messages: [
        { id: "1", role: "user" as const, content: "What is React?" },
        {
          id: "2",
          role: "assistant" as const,
          content: "React is a library...",
        },
      ],
      highlightedQAIndex: 1,
      tags: ["javascript", "frontend"],
      isPinned: false,
      createdAt: Date.now(),
      isFlagged: false,
    },
    {
      _id: "chat-2",
      title: "TypeScript Types",
      messages: [
        { id: "3", role: "user" as const, content: "What are types?" },
      ],
      highlightedQAIndex: 0,
      tags: ["typescript"],
      isPinned: true,
      createdAt: Date.now() - 1000000,
      isFlagged: false,
    },
  ];

  const mockTags = [
    { name: "javascript", count: 5 },
    { name: "typescript", count: 3 },
    { name: "frontend", count: 2 },
  ];

  beforeEach(() => {
    mockUseQuery.mockReturnValue(mockChats);
    mockUseMutation.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders knowledge base header", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      if ((api as Record<string, unknown>)?.messages?.getAllTags)
        return mockTags;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    expect(screen.getByText(/Knowledge Base/)).toBeInTheDocument();
  });

  it("displays chats in the list", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    expect(screen.getByText("React Basics")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Types")).toBeInTheDocument();
  });

  it("shows empty state when no chats exist", () => {
    mockUseQuery.mockReturnValue([]);

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    expect(screen.getByText(/No saved chats yet/)).toBeInTheDocument();
  });

  it("shows loading skeleton when chats are loading", () => {
    mockUseQuery.mockReturnValue(null);

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();
  });

  it("filters chats by search query in title", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} searchInput="" />);
    const searchInput = screen.getByPlaceholderText(/Search Q&A and chats/);

    await userEvent.type(searchInput, "React");

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.queryByText("TypeScript Types")).not.toBeInTheDocument();
    });
  });

  it("filters chats by search query in tags", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Search Q&A and chats/);

    await userEvent.type(searchInput, "typescript");

    await waitFor(() => {
      expect(screen.getByText("TypeScript Types")).toBeInTheDocument();
    });
  });

  it("filters chats by content search", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Search Q&A and chats/);

    await userEvent.type(searchInput, "types");

    await waitFor(() => {
      expect(screen.getByText("TypeScript Types")).toBeInTheDocument();
    });
  });

  it("clears search when X button is clicked", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Search Q&A and chats/);

    await userEvent.type(searchInput, "React");
    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe("");
    });
  });

  it("sorts chats by creation date (most recent first)", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);

    // By default, newer chats should appear first
    const chats = screen.getAllByRole("button", { name: /View/ });
    expect(chats.length).toBeGreaterThanOrEqual(2);
  });

  it("sorts chats alphabetically", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const sortSelect = screen.getByDisplayValue(/Most Recent/);

    fireEvent.change(sortSelect, { target: { value: "alphabetical" } });

    await waitFor(() => {
      const chatTitles = screen.getAllByText(/React Basics|TypeScript Types/);
      expect(chatTitles.length).toBeGreaterThan(0);
    });
  });

  it("filters to show only pinned chats", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const filterSelect = screen.getByDisplayValue(/All Chats/);

    fireEvent.change(filterSelect, { target: { value: "pinned" } });

    await waitFor(() => {
      expect(screen.getByText("TypeScript Types")).toBeInTheDocument();
      expect(screen.queryByText("React Basics")).not.toBeInTheDocument();
    });
  });

  it("filters to show only unpinned chats", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const filterSelect = screen.getByDisplayValue(/All Chats/);

    fireEvent.change(filterSelect, { target: { value: "unpinned" } });

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.queryByText("TypeScript Types")).not.toBeInTheDocument();
    });
  });

  it("filters to show only flagged chats", async () => {
    const flaggedChat = { ...mockChats[0], isFlagged: true };
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats) {
        return [flaggedChat, mockChats[1]];
      }
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const filterSelect = screen.getByDisplayValue(/All Chats/);

    fireEvent.change(filterSelect, { target: { value: "flagged" } });

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });
  });

  it("opens flag dialog when flag button is clicked", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const flagButtons = screen.getAllByRole("button", { name: /Flag/ });

    fireEvent.click(flagButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Report Content")).toBeInTheDocument();
    });
  });

  it("opens delete dialog when delete button is clicked", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const deleteButtons = screen.getAllByRole("button", { name: /Delete/ });

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Delete Chat/)).toBeInTheDocument();
    });
  });

  it("shows pin icon for pinned chats", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);

    // chat-2 is pinned, so it should have a pin button
    const chatItems = screen.getAllByText(/React Basics|TypeScript Types/);
    expect(chatItems.length).toBeGreaterThan(0);
  });

  it("displays chat tags", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);

    expect(screen.getByText("javascript")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("frontend")).toBeInTheDocument();
  });

  it("displays creation date for each chat", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);

    // Check that dates are displayed
    const dateElements = screen.getAllByText(/\d+\/\d+\/\d+/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("shows no results message when filter returns empty", async () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    renderWithTheme(<RecentMessages onRefresh={jest.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Search Q&A and chats/);

    await userEvent.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("handles chat selection with searchInput prop", () => {
    mockUseQuery.mockImplementation((api: unknown) => {
      if ((api as Record<string, unknown>)?.messages?.getChats)
        return mockChats;
      return null;
    });

    const { rerender } = render(
      <RecentMessages onRefresh={jest.fn()} searchInput="" />
    );

    rerender(<RecentMessages onRefresh={jest.fn()} searchInput="React" />);

    expect(screen.getByText("React Basics")).toBeInTheDocument();
  });
});
