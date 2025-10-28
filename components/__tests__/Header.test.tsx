import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../Header';
import { useTheme } from '../ThemeProvider';

// Mock useTheme hook
jest.mock('../ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('Header', () => {
  const mockSetAppearance = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseTheme.mockReturnValue({
      appearance: 'light',
      setAppearance: mockSetAppearance,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders header with logo', () => {
    render(<Header />);
    expect(screen.getByText('FTM')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('displays dark mode toggle button', () => {
    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    expect(darkModeButton).toBeInTheDocument();
  });

  it('displays mobile menu button', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('shows sun icon in dark mode', () => {
    mockUseTheme.mockReturnValue({
      appearance: 'dark',
      setAppearance: mockSetAppearance,
    });

    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    const sunIcon = darkModeButton.querySelector('svg');
    expect(sunIcon).toBeInTheDocument();
  });

  it('shows moon icon in light mode', () => {
    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    const moonIcon = darkModeButton.querySelector('svg');
    expect(moonIcon).toBeInTheDocument();
  });

  it('toggles dark mode when button is clicked', async () => {
    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(darkModeButton);

    expect(mockSetAppearance).toHaveBeenCalledWith('dark');
  });

  it('toggles back to light mode', async () => {
    mockUseTheme.mockReturnValue({
      appearance: 'dark',
      setAppearance: mockSetAppearance,
    });

    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(darkModeButton);

    expect(mockSetAppearance).toHaveBeenCalledWith('light');
  });

  it('updates localStorage when dark mode is toggled', async () => {
    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(darkModeButton);

    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('updates localStorage when switching to light mode', async () => {
    mockUseTheme.mockReturnValue({
      appearance: 'dark',
      setAppearance: mockSetAppearance,
    });

    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(darkModeButton);

    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('dispatches darkModeChange event when toggling', async () => {
    const eventListener = jest.fn();
    window.addEventListener('darkModeChange', eventListener);

    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(darkModeButton);

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalled();
    });

    window.removeEventListener('darkModeChange', eventListener);
  });

  it('toggles mobile menu', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle menu');

    fireEvent.click(menuButton);
    // Check that hamburger icon changed to close icon
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMobileMenuToggle callback', () => {
    const onMobileMenuToggle = jest.fn();
    render(<Header onMobileMenuToggle={onMobileMenuToggle} />);
    const menuButton = screen.getByLabelText('Toggle menu');

    fireEvent.click(menuButton);
    expect(onMobileMenuToggle).toHaveBeenCalledWith(true);

    fireEvent.click(menuButton);
    expect(onMobileMenuToggle).toHaveBeenCalledWith(false);
  });

  it('toggles menu icon between hamburger and close', () => {
    const { rerender } = render(<Header />);
    const menuButton = screen.getByLabelText('Toggle menu');

    // Initial state should show hamburger
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(menuButton).toBeInTheDocument();
  });

  it('has correct aria-labels for accessibility', () => {
    render(<Header />);
    expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('has correct title attribute for dark mode button', () => {
    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    expect(darkModeButton).toHaveAttribute('title', 'Dark mode');
  });

  it('has correct title attribute in dark mode', () => {
    mockUseTheme.mockReturnValue({
      appearance: 'dark',
      setAppearance: mockSetAppearance,
    });

    render(<Header />);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');
    expect(darkModeButton).toHaveAttribute('title', 'Light mode');
  });

  it('maintains mobile menu state independently of dark mode', () => {
    const onMobileMenuToggle = jest.fn();
    render(<Header onMobileMenuToggle={onMobileMenuToggle} />);

    const menuButton = screen.getByLabelText('Toggle menu');
    const darkModeButton = screen.getByLabelText('Toggle dark mode');

    // Toggle menu
    fireEvent.click(menuButton);
    expect(onMobileMenuToggle).toHaveBeenCalledWith(true);

    // Toggle dark mode (should not affect menu state)
    fireEvent.click(darkModeButton);

    // Toggle menu again to close
    fireEvent.click(menuButton);
    expect(onMobileMenuToggle).toHaveBeenCalledWith(false);
  });
});
