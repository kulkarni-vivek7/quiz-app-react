import { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAuthSlice } from '../../store/authSlice';

export const TokenExpiryNotification = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const showNotification = useAppSelector((state) => state.auth.showExpiryNotification);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        dispatch(clearAuthSlice());
        navigate('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showNotification, dispatch, navigate]);

  if (!showNotification) return null;

  return (
    <Snackbar
      open={showNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8, width: '100%' }}
    >
      <Alert 
        severity="warning" 
        variant="filled" 
        sx={{ width: '100%', maxWidth: 600 }}
      >
        Your session has expired. Please log in again to continue.
      </Alert>
    </Snackbar>
  );
};
