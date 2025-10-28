import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveAnswerDialog from "../SaveAnswerDialog";
import { useMutation } from "convex/react";

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

// Mock Radix UI components
jest.mock("@radix-ui/themes", () => ({
  Dialog: {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div>{children}</div> : null,
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Description: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    Close: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  TextField: {
    Root: (props: any) => <input {...props} />,
  },
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Spinner: () => <div>Loading...</div>,
}));

// Mock react-icons
jest.mock("@radix-ui/react-icons", () => ({
  Cross2Icon: (props: any) => <span {...props}>X</span>,
}));

jest.mock("convex/react");

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

// Mock fetch globally
global.fetch = jest.fn();

describe("SaveAnswerDialog", () => {
  const mockMessages = [
    { id: "1", role: "user" as const, content: "What is React?" },
    {
      id: "2",
      role: "assistant" as const,
      content: "React is a JavaScript library...",
    },
    { id: "3", role: "user" as const, content: "How does it work?" },
    {
      id: "4",
      role: "assistant" as const,
      content: "React uses a virtual DOM...",
    },
  ];

  const mockSaveChat = jest.fn().mockResolvedValue({ _id: "saved-chat-1" });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue(mockSaveChat);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Generated Chat Title" }),
    });
  });

  it("renders dialog when open", () => {
    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    expect(screen.getByText("Save to Knowledge Base")).toBeInTheDocument();
    expect(
      screen.getByText(/Save the entire chat session/)
    ).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    render(
      <SaveAnswerDialog
        isOpen={false}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    expect(
      screen.queryByText("Save to Knowledge Base")
    ).not.toBeInTheDocument();
  });

  it("generates title on dialog open", async () => {
    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: mockMessages }),
      });
    });
  });

  it("displays generated title", async () => {
    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generated Chat Title")).toBeInTheDocument();
    });
  });

  it("shows loading state while generating title", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ title: "Test Title" }),
              }),
            1000
          )
        )
    );

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generating title...")).toBeInTheDocument();
    });
  });

  it("uses fallback title on generation failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      const titleText = screen.getByText(/Chat -/);
      expect(titleText).toBeInTheDocument();
    });
  });

  it("allows adding tags via input field", async () => {
    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    const tagInput = screen.getByPlaceholderText("Add a tag...");
    await userEvent.type(tagInput, "javascript");

    const addButton = screen.getByRole("button", { name: /Add/ });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("javascript")).toBeInTheDocument();
    });
  });

  it("removes tags when X button is clicked", async () => {
    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    const tagInput = screen.getByPlaceholderText("Add a tag...");
    await userEvent.type(tagInput, "javascript");

    const addButton = screen.getByRole("button", { name: /Add/ });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("javascript")).toBeInTheDocument();
    });

    // Find and click the remove button
    const badgeContainer = screen.getByText("javascript").parentElement;
    const removeButton = badgeContainer?.querySelector("button");
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("javascript")).not.toBeInTheDocument();
    });
  });

  it("saves chat with title, messages, and tags", async () => {
    const onSave = jest.fn();

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={onSave}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generated Chat Title")).toBeInTheDocument();
    });

    const tagInput = screen.getByPlaceholderText("Add a tag...");
    await userEvent.type(tagInput, "javascript");
    const addButton = screen.getByRole("button", { name: /Add/ });
    fireEvent.click(addButton);

    const saveButton = screen.getByRole("button", {
      name: /Save Chat Session/,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveChat).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Generated Chat Title",
          messages: mockMessages,
          tags: ["javascript"],
        })
      );
      expect(onSave).toHaveBeenCalledWith(["javascript"]);
    });
  });

  it("disables save button while saving", async () => {
    mockSaveChat.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ _id: "saved-chat-1" }), 500)
        )
    );

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Generated Chat Title")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", {
      name: /Save Chat Session/,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toHaveTextContent("Saving...");
    });
  });

  it("disables save button while title is generating", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ title: "Test Title" }),
              }),
            500
          )
        )
    );

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    const saveButton = screen.getByRole("button", {
      name: /Save Chat Session/,
    });
    expect(saveButton).toBeDisabled();
  });

  it("uses fallback title on generation failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(
      <SaveAnswerDialog
        isOpen={true}
        onClose={jest.fn()}
        question="What is React?"
        onSave={jest.fn()}
        messages={mockMessages}
        selectedAnswerIndex={1}
      />
    );

    await waitFor(() => {
      const titleText = screen.getByText(/Chat -/);
      expect(titleText).toBeInTheDocument();
    });
  });
});
