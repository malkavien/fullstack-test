import { Box, Container } from '@mui/material';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import InvestmentsPage from './pages/InvestmentsPage';
import CreateInvestmentPage from './pages/CreateInvestmentPage';
import WithdrawInvestmentPage from './pages/WithdrawInvestmentPage';
import InvestmentDetailsPage from './pages/InvestmentDetailsPage';
import investmentsBanner from '../../coderockr.banner.svg'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Box
          component="img"
          src={investmentsBanner}
          alt="Investments"
          sx={{
            width: '100%',
            height: 100,
            objectFit: 'contain',
            display: 'block',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ py: 4 }}
        >
          <Routes>
            <Route
              path="/"
              element={<InvestmentsPage />}
            />

            <Route
              path="/investments"
              element={<InvestmentsPage />}
            />

            <Route
              path="/investments/new"
              element={<CreateInvestmentPage />}
            />

            <Route
              path="/investments/:id/withdraw"
              element={<WithdrawInvestmentPage />}
            />

            <Route
              path="/investments/:id"
              element={<InvestmentDetailsPage />}
            />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;