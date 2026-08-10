import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InvestmentsPage from '../InvestmentsPage';

const mockNavigate = vi.fn();

const mockUseInvestments = vi.fn();

vi.mock('../../hooks/useInvestments', () => ({
  useInvestments: (params: { page: number; limit: number }) =>
    mockUseInvestments(params),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('InvestmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    mockUseInvestments.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display investments', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [
          {
            id: 1,
            owner: 'Rafael',
            amount: '1000.00',
            currentAmount: '1036.97',
            createdAt: '2026-01-01T00:00:00.000Z',
            withdrawalDate: null,
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
        balance: '1036.97',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Rafael')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 1.036,97')).toHaveLength(2);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display Withdraw button for active investments', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [
          {
            id: 1,
            owner: 'Rafael',
            amount: '1000.00',
            currentAmount: '1036.97',
            createdAt: '2026-01-01T00:00:00.000Z',
            withdrawalDate: null,
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
        balance: '1036.97',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Withdraw' }),
    ).toBeInTheDocument();
  });

  it('should not display Withdraw button for withdrawn investments', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [
          {
            id: 1,
            owner: 'Rafael',
            amount: '1000.00',
            currentAmount: '0.00',
            createdAt: '2026-01-01T00:00:00.000Z',
            withdrawalDate: '2026-06-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
        balance: '0.00',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Withdrawn')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Withdraw' }),
    ).not.toBeInTheDocument();
  });

  it('should display empty state when there are no investments', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [],
        total: 0,
        page: 1,
        lastPage: 0,
        balance: '0.00',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Investments not found.'),
    ).toBeInTheDocument();

    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });

  it('should display error when loading investments fails', () => {
    mockUseInvestments.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load investments',
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Failed to load investments'),
    ).toBeInTheDocument();
  });

  it('should navigate to create investment page', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [],
        total: 0,
        page: 1,
        lastPage: 0,
        balance: '0.00',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /new investment/i,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/investments/new');
  });

  it('should navigate to investment details', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [
          {
            id: 10,
            owner: 'Rafael',
            amount: '1000.00',
            currentAmount: '1036.97',
            createdAt: '2026-01-01T00:00:00.000Z',
            withdrawalDate: null,
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
        balance: '1036.97',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'View' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/investments/10');
  });

  it('should navigate to withdrawal page', () => {
    mockUseInvestments.mockReturnValue({
      loading: false,
      error: null,
      data: {
        data: [
          {
            id: 10,
            owner: 'Rafael',
            amount: '1000.00',
            currentAmount: '1036.97',
            createdAt: '2026-01-01T00:00:00.000Z',
            withdrawalDate: null,
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
        balance: '1036.97',
      },
    });

    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Withdraw' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/investments/10/withdraw',
    );
  });
});