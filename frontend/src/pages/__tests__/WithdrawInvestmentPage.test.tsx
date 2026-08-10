import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WithdrawInvestmentPage from "../WithdrawInvestmentPage";
import { useInvestment } from "../../hooks/useInvestment";
import { useWithdrawInvestment } from "../../hooks/useWithdrawInvestment";

vi.mock("../../hooks/useInvestment", () => ({
  useInvestment: vi.fn(),
}));

vi.mock("../../hooks/useWithdrawInvestment", () => ({
  useWithdrawInvestment: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockExecute = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedUseInvestment = vi.mocked(useInvestment);

const mockedUseWithdrawInvestment = vi.mocked(useWithdrawInvestment);

function renderPage(id = "1") {
  return render(
    <MemoryRouter initialEntries={[`/investments/${id}/withdraw`]}>
      <Routes>
        <Route
          path="/investments/:id/withdraw"
          element={<WithdrawInvestmentPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

const investment = {
  id: 1,
  owner: "Rafael",
  amount: "1000.00",
  currentAmount: "1036.97",
  createdAt: "2026-01-01T00:00:00.000Z",
  withdrawalDate: null,
};

describe("WithdrawInvestmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockExecute.mockReset();

    mockedUseInvestment.mockReturnValue({
      data: investment,
      loading: false,
      error: null,
    });

    mockedUseWithdrawInvestment.mockReturnValue({
      execute: mockExecute,
      loading: false,
      error: null,
    });
  });

  it("should display loading state", () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display an error when loading investment fails", () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to load investment.",
    });

    renderPage();

    expect(screen.getByText("Failed to load investment.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to investments list/i,
      }),
    ).toBeInTheDocument();
  });

  it("should display not found state when investment does not exist", () => {
    mockedUseInvestment.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText("Investment not found.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to investments list/i,
      }),
    ).toBeInTheDocument();
  });

  it("should display investment information", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Withdraw Investment",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Investment #1")).toBeInTheDocument();

    expect(screen.getByText("Rafael")).toBeInTheDocument();

    expect(screen.getByText("Created At")).toBeInTheDocument();

    expect(screen.getByText("Current Balance")).toBeInTheDocument();

    expect(screen.getByText("R$ 1.036,97")).toBeInTheDocument();

    expect(
      screen.getByText("This operation cannot be undone."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Confirm Withdrawal",
      }),
    ).toBeInTheDocument();
  });

  it("should display validation error when withdrawal date is empty", async () => {
    renderPage();

    const dateInput = screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);

    fireEvent.change(dateInput, {
      target: {
        value: "",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Withdrawal",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Enter the withdrawal date."),
      ).toBeInTheDocument();
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should execute the withdrawal with the selected date", async () => {
    mockExecute.mockResolvedValue({
      amount: "1036.97",
      tax: "233.32",
      finalAmount: "803.65",
    });

    renderPage();

    const dateInput = screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);

    fireEvent.change(dateInput, {
      target: {
        value: "2026-06-01",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Withdrawal",
      }),
    );

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        withdrawalDate: "2026-06-01T03:00:00.000Z",
      }),
    );
  });

  it("should display processing state while withdrawal is being executed", () => {
    mockedUseWithdrawInvestment.mockReturnValue({
      execute: mockExecute,
      loading: true,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeDisabled();
  });

  it("should display withdrawal error", () => {
    mockedUseWithdrawInvestment.mockReturnValue({
      execute: mockExecute,
      loading: false,
      error: "Failed to withdraw investment.",
    });

    renderPage();

    expect(
      screen.getByText("Failed to withdraw investment."),
    ).toBeInTheDocument();
  });

  it("should display withdrawal result after successful withdrawal", async () => {
    mockExecute.mockResolvedValue({
      amount: "1036.97",
      tax: "233.32",
      finalAmount: "803.65",
    });

    renderPage();

    const dateInput = screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);

    fireEvent.change(dateInput, {
      target: {
        value: "2026-06-01",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Withdrawal",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Withdrawal Completed",
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("The withdrawal was completed successfully."),
    ).toBeInTheDocument();

    expect(screen.getByText("Investment Amount")).toBeInTheDocument();
    expect(screen.getByText("Tax")).toBeInTheDocument();
    expect(screen.getByText("Net Amount")).toBeInTheDocument();

    expect(screen.getByText("R$ 1.036,97")).toBeInTheDocument();
    expect(screen.getByText("R$ 233,32")).toBeInTheDocument();
    expect(screen.getByText("R$ 803,65")).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Back to investments list",
      }),
    ).toHaveLength(2);
  });

  it("should navigate back to investment details when canceling", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/investments/1");
  });

  it("should navigate back to investments from the result", async () => {
    mockExecute.mockResolvedValue({
      amount: "1036.97",
      tax: "233.32",
      finalAmount: "803.65",
    });

    renderPage();

    const dateInput = screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);

    fireEvent.change(dateInput, {
      target: {
        value: "2026-06-01",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Withdrawal",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Withdrawal Completed",
        }),
      ).toBeInTheDocument();
    });

    const backButtons = screen.getAllByRole("button", {
      name: "Back to investments list",
    });

    fireEvent.click(backButtons[1]);

    expect(mockNavigate).toHaveBeenCalledWith("/investments");
  });

  it("should navigate back to investment details", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Back to investments list",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/investments/1");
  });
});
