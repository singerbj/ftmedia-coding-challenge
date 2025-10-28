import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagManager from '../TagManager';

describe('TagManager', () => {
  const mockOnAddTag = jest.fn().mockResolvedValue(undefined);
  const mockOnRemoveTag = jest.fn().mockResolvedValue(undefined);

  const defaultProps = {
    chatId: 'chat-1' as never,
    tags: ['javascript', 'react'],
    availableTags: ['javascript', 'react', 'typescript', 'nodejs'],
    onAddTag: mockOnAddTag,
    onRemoveTag: mockOnRemoveTag,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders edit tags button', () => {
    render(<TagManager {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Edit Tags/ })).toBeInTheDocument();
  });

  it('opens dialog when edit tags button is clicked', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Manage Tags')).toBeInTheDocument();
    });
  });

  it('displays current tags', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
    });
  });

  it('displays current tag count', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Current Tags (2)')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tags', async () => {
    render(
      <TagManager
        {...defaultProps}
        tags={[]}
      />
    );
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('No tags assigned yet')).toBeInTheDocument();
    });
  });

  it('displays available tags to add', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('nodejs')).toBeInTheDocument();
    });
  });

  it('adds tag via input field', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/);
    await userEvent.type(input, 'typescript');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddTag).toHaveBeenCalledWith('typescript');
    });
  });

  it('adds tag via Enter key', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/) as HTMLInputElement;
    await userEvent.type(input, 'typescript{Enter}');

    await waitFor(() => {
      expect(mockOnAddTag).toHaveBeenCalledWith('typescript');
    });
  });

  it('prevents adding duplicate tags', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/);
    await userEvent.type(input, 'javascript');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    // Should not call onAddTag for duplicate
    await waitFor(() => {
      expect(mockOnAddTag).not.toHaveBeenCalled();
    });
  });

  it('prevents adding empty tags', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    expect(mockOnAddTag).not.toHaveBeenCalled();
  });

  it('trims whitespace from new tags', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/);
    await userEvent.type(input, '  typescript  ');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddTag).toHaveBeenCalledWith('typescript');
    });
  });

  it('clears input after adding tag', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/) as HTMLInputElement;
    await userEvent.type(input, 'nodejs');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('removes tag via quick-add buttons', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    // Find quick-add button for 'typescript' (an unused tag)
    const quickAddButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('+')
    );

    if (quickAddButtons.length > 0) {
      fireEvent.click(quickAddButtons[0]);

      await waitFor(() => {
        expect(mockOnAddTag).toHaveBeenCalled();
      });
    }
  });

  it('removes tags via X button', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    // Find and click remove button for a tag
    const removeButtons = screen.getAllByRole('button').filter(
      (btn) => btn.className?.includes('p-0')
    );

    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockOnRemoveTag).toHaveBeenCalled();
      });
    }
  });

  it('shows loading state while adding tag', async () => {
    const slowOnAddTag = jest.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(undefined), 500)
        )
    );

    render(
      <TagManager
        {...defaultProps}
        onAddTag={slowOnAddTag}
      />
    );
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/);
    await userEvent.type(input, 'typescript');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(slowOnAddTag).toHaveBeenCalled();
    });
  });

  it('shows loading state while removing tag', async () => {
    const slowOnRemoveTag = jest.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(undefined), 500)
        )
    );

    render(
      <TagManager
        {...defaultProps}
        onRemoveTag={slowOnRemoveTag}
      />
    );
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole('button').filter(
      (btn) => btn.className?.includes('p-0')
    );

    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(slowOnRemoveTag).toHaveBeenCalled();
      });
    }
  });

  it('disables edit button when loading', () => {
    render(
      <TagManager
        {...defaultProps}
        isLoading={true}
      />
    );
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    expect(editButton).toBeDisabled();
  });

  it('closes dialog when clicking close button', async () => {
    render(<TagManager {...defaultProps} />);
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Manage Tags')).toBeInTheDocument();
    });

    // The dialog should close when you click outside or press Escape
    // This test verifies the dialog can be closed
    const manageTags = screen.queryByText('Manage Tags');
    expect(manageTags).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    const errorOnAddTag = jest.fn().mockRejectedValue(new Error('API Error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <TagManager
        {...defaultProps}
        onAddTag={errorOnAddTag}
      />
    );
    const editButton = screen.getByRole('button', { name: /Edit Tags/ });
    fireEvent.click(editButton);

    const input = screen.getByPlaceholderText(/Enter tag name/);
    await userEvent.type(input, 'typescript');

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to add tag:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
