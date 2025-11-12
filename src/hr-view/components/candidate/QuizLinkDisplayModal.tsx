import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Tooltip } from '@mui/material';
import { Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import type { EnrollmentResponse } from '../../../types';
import { formatSubjectName } from '../../../services/candidate/formatSubjectName';

type QuizLinkDisplayModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    quizData: EnrollmentResponse;
    isQuizInviteUsed?: boolean;
}

const QuizLinkDisplayModal: React.FC<QuizLinkDisplayModalProps> = ({ open, setOpen, quizData, isQuizInviteUsed }) => {

    const [linkCopied, setLinkCopied] = useState(false);

    const handleCopyLink = async () => {
        if (isQuizInviteUsed) {
            return;
        }
        try {
            await navigator.clipboard.writeText(quizData.inviteLink);
            setLinkCopied(true);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };


    useEffect(() => {
        if (linkCopied) {
            const timer = setTimeout(() => {
                setLinkCopied(false);
                setOpen(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [linkCopied]);

    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="quiz-link-modal"
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
                        id="quiz-link-modal"
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 'bold',
                            color: '#1e293b'
                        }}
                    >
                        Quiz Link Details
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

                {/* Quiz Details Table */}
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
                                    Candidate ID
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {quizData.candidateId || 'N/A'}
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
                                    Subjects
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {
                                        quizData.subject.map((subject) => formatSubjectName(subject)).join(', ')
                                    }
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
                                    Quiz Link
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flex: 1,
                                            wordBreak: 'break-all',
                                            color: '#1e293b',
                                            userSelect: isQuizInviteUsed ? 'none' : 'auto',
                                            WebkitUserSelect: isQuizInviteUsed ? 'none' : 'auto',
                                            MozUserSelect: isQuizInviteUsed ? 'none' : 'auto',
                                            msUserSelect: isQuizInviteUsed ? 'none' : 'auto',
                                        }}
                                    >
                                        {quizData.inviteLink || 'N/A'}
                                    </Typography>
                                    <Tooltip title={isQuizInviteUsed ? "Quiz invite already used - copying disabled" : "Copy link"}>
                                        <IconButton
                                            onClick={handleCopyLink}
                                            size="small"
                                            sx={{
                                                color: isQuizInviteUsed ? 'grey.400' : '#1e293b',
                                                '&:hover': {
                                                    backgroundColor: isQuizInviteUsed ? 'transparent' : 'rgba(30, 41, 59, 0.1)',
                                                }
                                            }}
                                        >
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
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
                                    Quiz Time Limit
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {quizData.quizTimeLimit || 'N/A'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Copy Success Message */}
                {linkCopied && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                bgcolor: 'success.light',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                opacity: 0.9
                            }}
                        >
                            Link Copied!
                        </Typography>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default QuizLinkDisplayModal;
