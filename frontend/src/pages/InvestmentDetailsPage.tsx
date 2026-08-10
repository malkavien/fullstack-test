import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvestment } from '../hooks/useInvestment';

function InvestmentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const investmentId = Number(id);

  const {
    data: investment,
    loading,
    error,
  } = useInvestment(
    Number.isInteger(investmentId)
      ? investmentId
      : undefined,
  );

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR').format(
      new Date(value),
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          onClick={() => navigate('/investments')}
          sx={{
            mb: 2,
            textTransform: 'none',
          }}
        >
          ← Back to investments
        </Button>

        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!investment) {
    return (
      <Box>
        <Button
          onClick={() => navigate('/investments')}
          sx={{
            mb: 2,
            textTransform: 'none',
          }}
        >
          ← Back to investments
        </Button>

        <Alert severity="warning">
          Investment not found.
        </Alert>
      </Box>
    );
  }

  const isWithdrawn =
    investment.withdrawalDate !== null;

  const currentAmount = investment.currentAmount ?? 0;

  return (
    <Box>
      <Button
        onClick={() => navigate('/investments')}
        sx={{
          mb: 2,
          textTransform: 'none',
        }}
      >
        ← Back to investments
      </Button>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
            }}
          >
            Investment Details
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {investment.owner}
          </Typography>
        </Box>

        <Chip
          label={isWithdrawn ? 'Withdrawn' : 'Active'}
          size="medium"
          sx={{
            backgroundColor: isWithdrawn
              ? '#ffebee'
              : '#e8f5e9',
            color: isWithdrawn
              ? '#c62828'
              : '#2e7d32',
            fontWeight: 500,
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Invested Amount
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {formatCurrency(investment.amount)}
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Current Balance
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {formatCurrency(currentAmount)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: {
            xs: 2,
            sm: 4,
          },
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
          }}
        >
          Investment Information
        </Typography>

        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography color="text.secondary">
              Owner
            </Typography>

            <Typography sx={{ fontWeight: 500 }}>
              {investment.owner}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography color="text.secondary">
              Created At
            </Typography>

            <Typography sx={{ fontWeight: 500 }}>
              {formatDate(investment.createdAt)}
            </Typography>
          </Box>

          {isWithdrawn && (
            <>
              <Divider />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography color="text.secondary">
                  Withdrawal Date
                </Typography>

                <Typography sx={{ fontWeight: 500 }}>
                  {formatDate(
                    investment.withdrawalDate,
                  )}
                </Typography>
              </Box>
            </>
          )}

          {!isWithdrawn && (
            <>
              <Divider />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  pt: 1,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() =>
                    navigate(
                      `/investments/${investment.id}/withdraw`,
                    )
                  }
                  sx={{
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Withdraw Investment
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default InvestmentDetailsPage;