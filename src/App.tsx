import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { Box } from '@mui/material';
import Login from "./loginAndRegisterView/Login";
import Register from "./loginAndRegisterView/Register";
import HrRoutes from "./routes/HrRoutes";
import QuizApp from "./candidate-quiz/components/QuizApp";
import { TokenExpiryNotification } from "./hr-view/components/TokenExpiryNotification";
import setupAxiosInterceptor from "./utils/axiosInterceptor";

function App() {
  useEffect(() => {
    // Set up the Axios interceptor when the app loads
    setupAxiosInterceptor();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <Router>
        <TokenExpiryNotification />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hr/*" element={<HrRoutes />} />
          <Route path="/quiz" element={<QuizApp />} />
        </Routes>
      </Router>
    </Box>
  )
}

export default App