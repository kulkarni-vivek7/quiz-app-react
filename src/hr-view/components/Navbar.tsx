import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Box
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserDetails } from '../../types';
import { findUserByEmail } from '../../query/find-user-by-email';
import HrDetailsModel from './HrDetailsModel';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState<boolean>(false);

  const [userDetails, setUserDetails] = useState<UserDetails>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: ""
  })

  // Get user data from Redux
  const email = useAppSelector((state) => state.auth.email);

  const encryptedJwt = useAppSelector((state) => state.auth.jwt);

  useEffect(() => {
    const getUserByEmail = async () => {
      const user: UserDetails = await findUserByEmail(email, encryptedJwt);

      setUserDetails(user)
    }

    getUserByEmail();
  }, []);

  // Extract initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const navigationItems = [
    { label: 'Questions', path: '/hr' },
    { label: 'Candidates', path: '/hr/candidates' },
    { label: 'Answer Sets', path: '/hr/answerSets' }
  ];

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#1e293b',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {/* Logo/Brand and Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5rem',
                color: 'white'
              }}
            >
              HireQuiz
            </Typography>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: 'white',
                      position: 'relative',
                      textTransform: 'none',
                      fontSize: '1rem',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        width: '0',
                        height: '2px',
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        transform: 'translateX(-50%)',
                      },
                      '&:hover::after': {
                        width: '100%',
                      },
                      ...(isActive(item.path) && {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&::after': {
                          width: '100%',
                        }
                      })
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Avatar */}
          <Avatar
            sx={{
              bgcolor: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              width: 40,
              height: 40,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#2267d6',
              },
            }}
            onClick={() => setOpen(true)}
          >
            {getInitials(userDetails.name || 'User')}
          </Avatar>

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            color: 'white',
            mt: 1,
          }
        }}
      >
        {navigationItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <HrDetailsModel open={open} setOpen={setOpen} userDetails={userDetails} />
    </>
  );
};

export default Navbar;
