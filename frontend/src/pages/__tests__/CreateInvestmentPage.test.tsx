import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateInvestmentPage from '../CreateInvestmentPage';
import { createInvestment } from '../../services/investment.service';

vi.mock('../../services/investment.service', () => ({
  createInvestment: vi.fn(),
}));

const mockedCreateInvestment = vi.mocked(createInvestment);

const renderPage = () => {
  return render(
    <MemoryRouter>
      <CreateInvestmentPage />
    </MemoryRouter>,
  );
};

describe('CreateInvestmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the investment form', () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        name: /new investment/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/owner/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/amount/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /create investment/i,
      }),
    ).toBeInTheDocument();
  });

  it('should not create an investment when owner is empty', async () => {
    const user = userEvent.setup();

    renderPage();

    const amountInput = screen.getByLabelText(/amount/i);

    await user.type(amountInput, '1000');

    await user.click(
      screen.getByRole('button', {
        name: /create investment/i,
      }),
    );

    expect(
      screen.getByText(/Enter the owner name./i),
    ).toBeInTheDocument();

    expect(mockedCreateInvestment).not.toHaveBeenCalled();
  });

  it('should not create an investment when amount is zero', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByLabelText(/owner/i),
      'Rafael',
    );

    await user.type(
      screen.getByLabelText(/amount/i),
      '0',
    );

    await user.click(
      screen.getByRole('button', {
        name: /create investment/i,
      }),
    );

    expect(
      screen.getByText(/Enter an amount greater than zero./i),
    ).toBeInTheDocument();

    expect(mockedCreateInvestment).not.toHaveBeenCalled();
  });

  it('should create an investment with valid data', async () => {
    const user = userEvent.setup();

    mockedCreateInvestment.mockResolvedValue({
      id: 1,
      owner: 'Rafael',
      amount: '1000.00',
      currentAmount: '1000.00',
      createdAt: '2026-08-10T00:00:00.000Z',
      withdrawalDate: null,
    });

    renderPage();

    await user.type(
      screen.getByLabelText(/owner/i),
      'Rafael',
    );

    await user.type(
      screen.getByLabelText(/amount/i),
      '1000',
    );

    await user.click(
      screen.getByRole('button', {
        name: /create investment/i,
      }),
    );

    await waitFor(() => {
      expect(mockedCreateInvestment).toHaveBeenCalledTimes(1);
    });

    expect(mockedCreateInvestment).toHaveBeenCalledWith({
      owner: 'Rafael',
      amount: 1000,
      createdAt: expect.any(String),
    });
  });

  it('should display an error when the API fails', async () => {
    const user = userEvent.setup();

    mockedCreateInvestment.mockRejectedValue(
      new Error('Request failed'),
    );

    renderPage();

    await user.type(
      screen.getByLabelText(/owner/i),
      'Rafael',
    );

    await user.type(
      screen.getByLabelText(/amount/i),
      '1000',
    );

    await user.click(
      screen.getByRole('button', {
        name: /create investment/i,
      }),
    );

    expect(
      await screen.findByText(
        /Failed to create investment./i,
      ),
    ).toBeInTheDocument();
  });
});