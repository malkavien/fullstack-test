import {
  Alert,
  Box,
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
} from '@mui/material';
import { useState } from 'react';
import { useInvestments } from '../hooks/useInvestments';

function InvestmentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, loading, error, refetch } = useInvestments({
    page,
    limit,
  });

  const handlePageChange = async (
    _: unknown,
    newPage: number,
  ): Promise<void> => {
    const nextPage = newPage + 1;

    setPage(nextPage);

    await refetch({ page: nextPage, limit });
  };

  const handleRowsPerPageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const nextLimit = Number(event.target.value);

    setLimit(nextLimit);
    setPage(1);

    await refetch({ page: 1, limit: nextLimit });
  };

  const formatCurrency = (value: string): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const formatDate = (value: string | null): string => {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
  };

  if (loading && !data) {
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
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Investimentos
      </Typography>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Proprietário</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data de criação</TableCell>
                <TableCell>Data de saque</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.data.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell>{investment.id}</TableCell>

                  <TableCell>{investment.owner}</TableCell>

                  <TableCell>
                    {formatCurrency(investment.amount)}
                  </TableCell>

                  <TableCell>
                    {formatDate(investment.createdAt)}
                  </TableCell>

                  <TableCell>
                    {formatDate(investment.withdrawalDate)}
                  </TableCell>
                </TableRow>
              ))}

              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum investimento encontrado.
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
          labelRowsPerPage="Itens por página:"
        />
      </Paper>
    </Box>
  );
}

export default InvestmentsPage;