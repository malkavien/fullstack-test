import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvestment } from "../hooks/useInvestment";
import { useWithdrawInvestment } from "../hooks/useWithdrawInvestment";

function WithdrawInvestmentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const investmentId = Number(id);

  const {
    data: investment,
    loading: loadingInvestment,
    error: investmentError,
  } = useInvestment(Number.isInteger(investmentId) ? investmentId : undefined);

  const {
    execute,
    loading: withdrawing,
    error: withdrawalError,
  } = useWithdrawInvestment();

  const [withdrawalDate, setWithdrawalDate] = useState(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [dateError, setDateError] = useState(false);

  const [result, setResult] = useState<{
    amount: string;
    tax: string;
    finalAmount: string;
  } | null>(null);

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!withdrawalDate) {
      setDateError(true);
      return;
    }

    if (!investment) {
      return;
    }

    setDateError(false);

    try {
      const withdrawal = await execute(investment.id, {
        withdrawalDate: new Date(`${withdrawalDate}T00:00:00`).toISOString(),
      });

      setResult({
        amount: withdrawal.amount,
        tax: withdrawal.tax,
        finalAmount: withdrawal.finalAmount,
      });
    } catch {
      // Error is already handled by the hook.
    }
  };

  if (loadingInvestment) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (investmentError) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/investments")}
          sx={{
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to investments list
        </Button>

        <Alert severity="error">{investmentError}</Alert>
      </Box>
    );
  }

  if (!investment) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/investments")}
          sx={{
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to investments list
        </Button>

        <Alert severity="warning">Investment not found.</Alert>
      </Box>
    );
  }

  if (result) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/investments")}
          sx={{
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to investments list
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "success.light",
            }}
          >
            <CheckCircleIcon color="success" />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
              }}
            >
              Withdrawal Completed
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Investment #{investment.id}
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: {
              xs: 2,
              sm: 4,
            },
            maxWidth: 650,
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              The withdrawal was completed successfully.
            </Alert>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Investment Amount
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(result.amount)}
                  </Typography>
                </CardContent>
              </Card>

              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Tax
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(result.tax)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Net Amount
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatCurrency(result.finalAmount)}
              </Typography>
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/investments")}
                sx={{
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Back to investments list
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/investments/${investment.id}`)}
        sx={{
          mb: 2,
          textTransform: "none",
        }}
      >
        Back to investments list
      </Button>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "action.hover",
          }}
        >
          <AccountBalanceIcon />
        </Box>

        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
            }}
          >
            Withdraw Investment
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Investment #{investment.id}
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: {
            xs: 2,
            sm: 4,
          },
          maxWidth: 650,
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Owner
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {investment.owner}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {formatDate(investment.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Current Balance
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatCurrency(investment.currentAmount ?? investment.amount)}
              </Typography>
            </CardContent>
          </Card>

          <Divider />

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontWeight: 500,
              }}
            >
              Withdrawal Date
            </Typography>

            <Box
              component="input"
              type="date"
              value={withdrawalDate}
              onChange={(event) => {
                setWithdrawalDate(event.target.value);

                if (dateError) {
                  setDateError(false);
                }
              }}
              disabled={withdrawing}
              sx={{
                width: "100%",
                boxSizing: "border-box",
                padding: "16px 14px",
                fontSize: "16px",
                fontFamily: "inherit",
                border: "1px solid",
                borderColor: dateError ? "error.main" : "rgba(0, 0, 0, 0.23)",
                borderRadius: 1,
                backgroundColor: withdrawing
                  ? "action.disabledBackground"
                  : "background.paper",
              }}
            />

            {dateError && (
              <Typography
                variant="caption"
                color="error"
                sx={{
                  mt: 0.5,
                  display: "block",
                }}
              >
                Enter the withdrawal date.
              </Typography>
            )}

            <Alert severity="warning" sx={{ mt: 3 }}>
              This operation cannot be undone.
            </Alert>

            {withdrawalError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {withdrawalError}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(`/investments/${investment.id}`)}
                disabled={withdrawing}
                sx={{
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={withdrawing}
                sx={{
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default WithdrawInvestmentPage;