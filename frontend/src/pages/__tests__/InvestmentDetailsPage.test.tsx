import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvestmentDetailsPage from '../InvestmentDetailsPage';
import { useInvestment } from '../../hooks/useInvestment';

vi.mock('../../hooks/useInvestment', () => ({
  useInvestment: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedUseInvestment = vi.mocked(useInvestment);

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/investments/${id}`]}>
      <Routes>
        <Route
          path="/investments/:id"
          element={<InvestmentDetailsPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('InvestmentDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display active investment details', () => {
    mockedUseInvestment.mockReturnValue({
      data: {
        id: 1,
        owner: 'Rafael',
        amount: '1000.00',
        currentAmount: '1036.97',
        createdAt: '2026-01-01T00:00:00.000Z',
        withdrawalDate: null,
      },
      loading: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Investment Details',
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText('Rafael')).toHaveLength(2);
    expect(screen.getByText('Active')).toBeInTheDocument();

    expect(screen.getByText('Invested Amount')).toBeInTheDocument();
    expect(screen.getByText('Current Balance')).toBeInTheDocument();

    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.036,97')).toBeInTheDocument();

    expect(screen.getByText('Investment Information')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Withdraw Investment',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Withdrawal Date'),
    ).not.toBeInTheDocument();
  });

  it('should display withdrawn investment details', () => {
    mockedUseInvestment.mockReturnValue({
      data: {
        id: 1,
        owner: 'Rafael',
        amount: '1000.00',
        currentAmount: '1036.97',
        createdAt: '2026-01-01T00:00:00.000Z',
        withdrawalDate: '2026-06-01T00:00:00.000Z',
      },
      loading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('Withdrawn')).toBeInTheDocument();

    expect(screen.getByText('Withdrawal Date')).toBeInTheDocument();
    expect(screen.getByText('01/06/2026')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Withdraw Investment',
      }),
    ).not.toBeInTheDocument();
  });

  it('should display an error when loading investment fails', () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load investment.',
    });

    renderPage();

    expect(
      screen.getByText('Failed to load investment.'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /back to investments list/i,
      }),
    ).toBeInTheDocument();
  });

  it('should display not found state when investment does not exist', () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByText('Investment not found.'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /back to investments list/i,
      }),
    ).toBeInTheDocument();
  });

  it('should navigate back to investments', () => {
    mockedUseInvestment.mockReturnValue({
      data: {
        id: 1,
        owner: 'Rafael',
        amount: '1000.00',
        currentAmount: '1036.97',
        createdAt: '2026-01-01T00:00:00.000Z',
        withdrawalDate: null,
      },
      loading: false,
      error: null,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: /back to investments list/i,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/investments');
  });

  it('should navigate to withdrawal page for an active investment', () => {
    mockedUseInvestment.mockReturnValue({
      data: {
        id: 1,
        owner: 'Rafael',
        amount: '1000.00',
        currentAmount: '1036.97',
        createdAt: '2026-01-01T00:00:00.000Z',
        withdrawalDate: null,
      },
      loading: false,
      error: null,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Withdraw Investment',
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/investments/1/withdraw',
    );
  });
});