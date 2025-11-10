import React, { useEffect, useState } from 'react'
import { type EnrollmentResponse, type Candidate, type QuizInvite } from '../../types'
import { useAppSelector } from '../../store/hooks';
import { findAllQuizCompletedCandidates } from '../../query/find-all-candidates';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import QuizLinkDisplayModal from '../components/candidate/QuizLinkDisplayModal';
import { constructQuizLinkResponse } from '../../services/quiz/construct-quiz-link';
import ShowSubjectsModal from '../components/candidate/ShowSubjectsModal';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { deleteCandidateHandler } from '../../services/candidate/deleteCandidate';

type ViewAllQuizCompletedCandidatesModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewAllQuizCompletedCandidatesModal: React.FC<ViewAllQuizCompletedCandidatesModalProps> = ({ open, setOpen }) => {

    const [candidates, setCandidates] = useState<Candidate[] | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [totalCandidates, setTotalCandidates] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
    const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse>({
        candidateId: '',
        subject: [],
        inviteLink: '',
        quizTimeLimit: ""
    })

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    const [errorMsg, setErrorMsg] = useState<string>("")

    const [showSubjectsModalOpen, setShowSubjectsModalOpen] = useState<boolean>(false);

    const [quizInvite, setQuizInvite] = useState<QuizInvite>({
        id: '',
        token: '',
        quizTimeLimit: '',
        candidateId: '',
        subject: [],
        used: false
    })

    const [quizLinkDisplayModalOpen, setQuizLinkDisplayModalOpen] = useState<boolean>(false);

    const encryptedJwt = useAppSelector((state) => state.auth.jwt);

    const handleRefreshTrigger = () => {
        setRefreshTrigger(prev => !prev);
    }

    const fetchQuizCompletedCandidates = async () => {
        try {

            const response = await findAllQuizCompletedCandidates(encryptedJwt, page, rowsPerPage);
            setCandidates(response.listOfCandidates);
            setTotalCandidates(response.totalCandidates);

        }
        catch (error) {
            setCandidates([])
            console.error("Faild to fetch candidates: ", error);

        }
    }

    useEffect(() => {
        fetchQuizCompletedCandidates();
    }, [page, rowsPerPage, refreshTrigger])

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xl' fullWidth PaperProps={{ sx: { borderRadius: '0.75rem', boxShadow: 3 } }}>
                <div className="flex items-center justify-between">
                    <div className="text-center w-full">
                        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem' }, fontWeight: 'bold', color: '#1e293b' }}>
                            Quiz Completed Candidates
                        </DialogTitle>
                    </div>

                    <Box sx={{ mr: { xs: 3, sm: 3 } }}>
                        <IconButton
                            onClick={() => setOpen(false)}
                            sx={{
                                color: '#1e293b',
                                '&:hover': {
                                    backgroundColor: 'rgba(30, 41, 59, 0.1)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </div>
                <DialogContent>
                    {
                        errorMsg && (
                            <Typography
                                variant='body1'
                                color='error'
                                sx={{ mt: 2, display: 'block', textAlign: 'center' }}
                            >
                                {errorMsg}
                            </Typography>
                        )
                    }

                    <Paper sx={{ marginBottom: 4, padding: 1, boxShadow: 3, borderRadius: '0.5rem', backgroundColor: 'white', overflowX: 'auto' }}>
                        <TableContainer sx={{ maxHeight: 350, overflowY: 'auto' }}>
                            <Table stickyHeader aria-label="candidates table" sx={{ minWidth: '100%' }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e5e7eb' }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Age</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Phone</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Subject</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        candidates === null || candidates === undefined ? (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: 'center', paddingY: 1.1, color: '#6b7280' }}>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : candidates.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: 'center', paddingY: 1.1, color: '#6b7280' }}>
                                                    No quiz completed candidates found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            candidates.map((candidate) => (
                                                <TableRow key={candidate.id} sx={{ borderBottom: '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f9fafb' } }}>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.id}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.name}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.age}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.email}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.phone}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>
                                                        <Button variant='contained' size='large' fullWidth
                                                            sx={{
                                                                borderRadius: 8,
                                                                bgcolor: "#1e293b",
                                                                boxShadow: 3,
                                                                fontWeight: "medium",
                                                                ":hover": { bgcolor: "#0c1017" }
                                                            }}
                                                            onClick={() => {
                                                                setSelectedSubjects(candidate.subject)
                                                                setShowSubjectsModalOpen(true)
                                                            }}
                                                        >
                                                            View Subjects
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>
                                                        <IconButton title='View Quiz Link' sx={{ color: '#1e293b', cursor: 'pointer' }} onClick={async () => {
                                                            await constructQuizLinkResponse(encryptedJwt, candidate.id, candidate.subject, setQuizInvite, setEnrollmentResponse, setQuizLinkDisplayModalOpen)
                                                        }}>
                                                            <LinkIcon />
                                                        </IconButton>
                                                        
                                                        <IconButton title='Delete Candidate' sx={{ color: '#1e293b', cursor: 'pointer' }} onClick={async () => await deleteCandidateHandler(encryptedJwt, candidate.id, setErrorMsg, handleRefreshTrigger)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15, 20]}
                            component={'div'}
                            count={totalCandidates}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_: unknown, newPage: number) => {
                                setPage(newPage)
                            }}
                            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0)
                            }}
                            sx={{ marginTop: 1 }}
                        />
                    </Paper>
                </DialogContent>
            </Dialog>

            <QuizLinkDisplayModal open={quizLinkDisplayModalOpen} setOpen={setQuizLinkDisplayModalOpen} quizData={enrollmentResponse} isQuizInviteUsed={quizInvite.used} />
            <ShowSubjectsModal open={showSubjectsModalOpen} setOpen={setShowSubjectsModalOpen} subjects={selectedSubjects} />
        </>
    )
}

export default ViewAllQuizCompletedCandidatesModal
