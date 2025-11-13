import axios from 'axios';
import { store } from '../store';
import { showTokenExpiryNotification } from '../store/authSlice';

const setupAxiosInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        // Only show the notification if we're not already on the login or register page
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.startsWith('/register')) {
          store.dispatch(showTokenExpiryNotification());
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptor;
