import { Box } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import InvestmentsPage from './pages/InvestmentsPage';

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ p: 4 }}>
        <Routes>
          <Route path="/" element={<InvestmentsPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;