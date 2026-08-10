import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvestment } from '../hooks/useCreateInvestment';

function CreateInvestmentPage() {
  const navigate = useNavigate();

  const { execute, loading, error } =
    useCreateInvestment();

  const [owner, setOwner] = useState('');
  const [amount, setAmount] = useState('');

  const [ownerError, setOwnerError] =
    useState(false);

  const [amountError, setAmountError] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const trimmedOwner = owner.trim();
    const numericAmount = Number(amount);

    const invalidOwner =
      trimmedOwner.length === 0;

    const invalidAmount =
      amount.trim().length === 0 ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0;

    setOwnerError(invalidOwner);
    setAmountError(invalidAmount);

    if (invalidOwner || invalidAmount) {
      return;
    }

    try {
      await execute({
        owner: trimmedOwner,
        amount: numericAmount,
        createdAt: new Date().toISOString(),
      });

      navigate('/investments');
    } catch {
      // Error is already handled by the hook.
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/investments')}
        sx={{
          mb: 2,
          textTransform: 'none',
        }}
      >
        Back to investments
      </Button>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'action.hover',
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
            New Investment
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Create a new investment
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
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            fullWidth
            label="Owner"
            value={owner}
            onChange={(event) => {
              setOwner(event.target.value);

              if (ownerError) {
                setOwnerError(false);
              }
            }}
            error={ownerError}
            helperText={
              ownerError
                ? 'Enter the owner name.'
                : ''
            }
            margin="normal"
            disabled={loading}
            autoFocus
          />

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);

              if (amountError) {
                setAmountError(false);
              }
            }}
            error={amountError}
            helperText={
              amountError
                ? 'Enter an amount greater than zero.'
                : ''
            }
            margin="normal"
            disabled={loading}
            slotProps={{
              htmlInput: {
                min: 0,
                step: '0.01',
              },
            }}
          />

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate('/investments')
              }
              disabled={loading}
              sx={{
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {loading
                ? 'Creating...'
                : 'Create Investment'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateInvestmentPage;