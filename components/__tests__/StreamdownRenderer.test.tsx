import { render, screen } from "@testing-library/react";
import StreamdownRenderer from "../StreamdownRenderer";

// Mock streamdown library
jest.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: string }) => (
    <div data-testid="streamdown">{children}</div>
  ),
}));

describe("StreamdownRenderer", () => {
  it("renders content using Streamdown", () => {
    render(<StreamdownRenderer content="Test content" />);
    const streamdown = screen.getByTestId("streamdown");
    expect(streamdown).toBeInTheDocument();
    expect(streamdown).toHaveTextContent("Test content");
  });

  it("does not render when content is empty", () => {
    const { container } = render(<StreamdownRenderer content="" />);
    expect(screen.queryByTestId("streamdown")).not.toBeInTheDocument();
    expect(
      container.querySelector(".streamdown-container")
    ).toBeInTheDocument();
  });

  it('shows spinner and "Answering..." text when streaming', () => {
    render(<StreamdownRenderer content="Test" isStreaming={true} />);
    expect(screen.getByText("Answering...")).toBeInTheDocument();
    // Radix UI Spinner uses span elements, so we check for the Spinner's visual structure
    const spinner = document.querySelector(".rt-Spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("does not show spinner when not streaming", () => {
    render(<StreamdownRenderer content="Test" isStreaming={false} />);
    expect(screen.queryByText("Answering...")).not.toBeInTheDocument();
    const spinner = document.querySelector(".rt-Spinner");
    expect(spinner).not.toBeInTheDocument();
  });

  it("memoizes rendered content", () => {
    const { rerender } = render(<StreamdownRenderer content="Initial" />);
    const firstRender = screen.getByTestId("streamdown");

    // Re-render with same content
    rerender(<StreamdownRenderer content="Initial" />);
    const secondRender = screen.getByTestId("streamdown");

    // Should be the same element (memoized)
    expect(firstRender).toBe(secondRender);
  });

  it("updates when content changes", () => {
    const { rerender } = render(<StreamdownRenderer content="Initial" />);
    expect(screen.getByTestId("streamdown")).toHaveTextContent("Initial");

    rerender(<StreamdownRenderer content="Updated" />);
    expect(screen.getByTestId("streamdown")).toHaveTextContent("Updated");
  });
});
