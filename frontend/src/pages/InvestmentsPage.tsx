import {
  Alert,
  Box,
  Button,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Card,
  Chip,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import { useInvestments } from "../hooks/useInvestments";
import { useNavigate } from "react-router-dom";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function InvestmentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, loading, error } = useInvestments({
    page,
    limit,
  });

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextLimit = Number(event.target.value);

    setLimit(nextLimit);
    setPage(1);
  };

  const formatCurrency = (value: string): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (value: string | null): string => {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
  };

  if (loading && !data) {
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Card
          sx={{
            minWidth: 300,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CardContent
            sx={{
              py: 2,
              "&:last-child": {
                pb: 2,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
              }}
            >
              Total Balance
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 700,
              }}
            >
              {formatCurrency(data?.balance ?? '0')}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Current balance across active investments
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          startIcon={<AccountBalanceIcon />}
          onClick={() => navigate("/investments/new")}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: 2,
          }}
        >
           New Investment
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Current Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.data.map((investment) => (
                <TableRow key={investment.id} hover>
                  <TableCell>{formatDate(investment.createdAt)}</TableCell>

                  <TableCell>{investment.owner}</TableCell>

                  <TableCell>{formatCurrency(investment.amount)}</TableCell>

                  <TableCell>
                    {formatCurrency(investment.currentAmount)}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={investment.withdrawalDate ? "Withdrawn" : "Active"}
                      sx={{
                        backgroundColor: investment.withdrawalDate
                          ? "#ffebee"
                          : "#e8f5e9",
                        color: investment.withdrawalDate
                          ? "#c62828"
                          : "#2e7d32",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          navigate(`/investments/${investment.id}`)
                        }
                      >
                        View
                      </Button>

                      {!investment.withdrawalDate && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            navigate(`/investments/${investment.id}/withdraw`)
                          }
                        >
                          Withdraw
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    Investments not found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={(data?.page ?? 1) - 1}
          rowsPerPage={limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Rows per page:"
        />
      </Paper>
    </Box>
  );
}

export default InvestmentsPage;
