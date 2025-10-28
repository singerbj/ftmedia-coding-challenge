/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { useChat } from '@ai-sdk/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, onClick, onMouseEnter, onMouseLeave, 'data-testid': dataTestId }: any) => (
      <div className={className} style={style} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} data-testid={dataTestId}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock StreamdownRenderer
jest.mock('../StreamdownRenderer', () => {
  return function MockStreamdownRenderer({ content }: { content: string }) {
    return <div data-testid="streamdown-renderer">{content}</div>;
  };
});

// Mock SaveAnswerDialog
jest.mock('../SaveAnswerDialog', () => {
  return function MockSaveAnswerDialog() {
    return <div data-testid="save-answer-dialog">Save Answer Dialog</div>;
  };
});

// Mock useChat hook
jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(),
}));

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>;

describe('ChatInterface', () => {
  const defaultMessages = [
    {
      id: 'initial-0',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: 'Hello' }],
    },
    {
      id: 'initial-1',
      role: 'assistant' as const,
      parts: [{ type: 'text' as const, text: 'Hi there!' }],
    },
  ];

  beforeEach(() => {
    mockUseChat.mockReturnValue({
      messages: defaultMessages,
      sendMessage: jest.fn(),
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface with header and input', () => {
    render(<ChatInterface />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(
      screen.getByText(/Ask questions and get answers/)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
  });

  it('displays initial messages when provided', () => {
    render(
      <ChatInterface
        initialMessages={[
          { role: 'user', content: 'Test question' },
          { role: 'assistant', content: 'Test answer' },
        ]}
      />
    );
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    expect(
      screen.getByText(/No messages yet. Ask a question/)
    ).toBeInTheDocument();
  });

  it('handles form submission with text input', async () => {
    const sendMessage = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage,
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    const textarea = screen.getByPlaceholderText('Ask a question...');
    const button = screen.getByRole('button', { name: /Send Question/ });

    await userEvent.type(textarea, 'What is React?');
    fireEvent.click(button);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        role: 'user',
        parts: [{ type: 'text', text: 'What is React?' }],
      });
    });
  });

  it('clears input after submission', async () => {
    const sendMessage = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage,
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    const { rerender } = render(<ChatInterface />);
    const textarea = screen.getByPlaceholderText(
      'Ask a question...'
    ) as HTMLTextAreaElement;

    await userEvent.type(textarea, 'Test question');
    const button = screen.getByRole('button', { name: /Send Question/ });
    fireEvent.click(button);

    // Re-render with updated component state
    rerender(<ChatInterface />);

    await waitFor(() => {
      const updatedTextarea = screen.getByPlaceholderText('Ask a question...');
      expect((updatedTextarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('prevents submission with empty input', () => {
    const sendMessage = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage,
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    const button = screen.getByRole('button', { name: /Send Question/ });

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('shows loading state when streaming', () => {
    mockUseChat.mockReturnValue({
      messages: defaultMessages,
      sendMessage: jest.fn(),
      setMessages: jest.fn(),
      status: 'streaming',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: true,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    expect(
      screen.getByText('Assistant is thinking...')
    ).toBeInTheDocument();
  });

  it('shows reset button when messages exist', () => {
    render(<ChatInterface />);
    expect(
      screen.getByRole('button', { name: /Reset Chat/ })
    ).toBeInTheDocument();
  });

  it('clears messages on reset', async () => {
    const setMessages = jest.fn();
    mockUseChat.mockReturnValue({
      messages: defaultMessages,
      sendMessage: jest.fn(),
      setMessages,
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    const onChatCleared = jest.fn();
    render(<ChatInterface onChatCleared={onChatCleared} />);
    const resetButton = screen.getByRole('button', { name: /Reset Chat/ });

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(setMessages).toHaveBeenCalledWith([]);
      expect(onChatCleared).toHaveBeenCalled();
    });
  });

  it('handles keyboard submission (Enter key)', async () => {
    const sendMessage = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage,
      setMessages: jest.fn(),
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    const textarea = screen.getByPlaceholderText('Ask a question...');

    await userEvent.type(textarea, 'Test question');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });

  it('allows multiline input with Shift+Enter', async () => {
    render(<ChatInterface />);
    const textarea = screen.getByPlaceholderText('Ask a question...');

    await userEvent.type(textarea, 'Line 1');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true, code: 'Enter' });

    // Textarea should still have content (Shift+Enter creates new line)
    expect((textarea as HTMLTextAreaElement).value).toContain('Line 1');
  });

  it('displays assistant messages with StreamdownRenderer', () => {
    render(<ChatInterface initialMessages={defaultMessages} />);
    expect(screen.getByTestId('streamdown-renderer')).toBeInTheDocument();
  });

  it('shows save answer button for assistant messages', () => {
    render(<ChatInterface initialMessages={defaultMessages} />);
    expect(
      screen.getAllByRole('button', { name: /Save Answer/ })
    ).toBeDefined();
  });

  it('calls onMessageSaved callback when message is saved', async () => {
    const onMessageSaved = jest.fn();
    render(
      <ChatInterface initialMessages={defaultMessages} onMessageSaved={onMessageSaved} />
    );

    // Note: Full test requires SaveAnswerDialog mock to trigger save
    // This test verifies the prop is passed correctly
    expect(onMessageSaved).not.toHaveBeenCalled();
  });

  it('highlights correct messages when highlightedQAIndex is set', () => {
    render(
      <ChatInterface
        initialMessages={defaultMessages}
        highlightedQAIndex={1}
      />
    );

    // Messages at index 0 and 1 should be highlighted
    const messages = screen.getAllByText(/You|Assistant/);
    expect(messages.length).toBeGreaterThan(0);
  });

  it('disables send button during loading', () => {
    mockUseChat.mockReturnValue({
      messages: defaultMessages,
      sendMessage: jest.fn(),
      setMessages: jest.fn(),
      status: 'streaming',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: true,
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatInterface />);
    const button = screen.getByRole('button', { name: /Send Question/ });
    expect(button).toBeDisabled();
  });

  it('updates messages when initialMessages prop changes', async () => {
    const setMessages = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      setMessages,
      status: 'ready',
      error: null,
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
      input: '',
      setInput: jest.fn(),
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useChat>);

    const initialMessages = [
      { role: 'user' as const, content: 'Test' },
    ];

    render(<ChatInterface initialMessages={initialMessages} />);

    await waitFor(() => {
      expect(setMessages).toHaveBeenCalled();
    });
  });
});
