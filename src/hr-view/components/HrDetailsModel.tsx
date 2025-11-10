import { Modal, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Close as CloseIcon } from '@mui/icons-material';
import React from 'react';
import type { UserDetails } from '../../types';
import { useDispatch } from 'react-redux';
import { clearAuthSlice } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
type HrDetailsModelProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    userDetails: UserDetails;
}

const HrDetailsModel: React.FC<HrDetailsModelProps> = ({ open, setOpen, userDetails }) => {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(clearAuthSlice());
        setOpen(false);
        navigate('/')
    };

    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="user-details-modal"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '600px' },
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                {/* Main Heading with Close Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography
                        id="user-details-modal"
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: 'bold',
                            color: '#1e293b'
                        }}
                    >
                        Your Details
                    </Typography>
                    <IconButton
                        onClick={() => setOpen(false)}
                        sx={{
                            color: '#1e293b',
                            '&:hover': {
                                backgroundColor: 'rgba(30, 41, 59, 0.1)',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: '30%',
                                        bgcolor: 'grey.50',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    Name
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {userDetails.name || 'N/A'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: '30%',
                                        bgcolor: 'grey.50',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {userDetails.email || 'N/A'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: '30%',
                                        bgcolor: 'grey.50',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    Phone
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {userDetails.phone || 'N/A'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: '30%',
                                        bgcolor: 'grey.50'
                                    }}
                                >
                                    Role
                                </TableCell>
                                <TableCell>
                                    {userDetails.role || 'N/A'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Logout Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                            px: 3,
                            py: 1.5,
                            fontSize: '1rem',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4,
                            }
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default HrDetailsModel;