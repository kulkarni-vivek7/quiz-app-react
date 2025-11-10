import React, { useEffect, useState } from 'react'
import type { Candidate, EnrollmentResponse, QuizInvite } from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { searchCandidates } from '../../../query/find-all-candidates';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputBase, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, type SelectChangeEvent } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { constructQuizLinkResponse } from '../../../services/quiz/construct-quiz-link';
import { deleteCandidateHandler } from '../../../services/candidate/deleteCandidate';
import QuizLinkDisplayModal from './QuizLinkDisplayModal';
import { Close as CloseIcon } from '@mui/icons-material';
import ShowSubjectsModal from './ShowSubjectsModal';

type SearchCandidatesModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onRefreshActive: () => void;
}

const SearchCandidatesModal: React.FC<SearchCandidatesModalProps> = ({ open, setOpen, onRefreshActive }) => {

    const [searchParam, setSearchParam] = useState<string>("id");
    const [searchValue, setSearchValue] = useState<string>("");
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [totalCandidates, setTotalCandidates] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
    const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse>({
        candidateId: '',
        subject: [],
        inviteLink: '',
        quizTimeLimit: ''
    })
    const [errorMsg, setErrorMsg] = useState<string>("")

    const [quizInvite, setQuizInvite] = useState<QuizInvite>({
        id: '',
        token: '',
        quizTimeLimit: '',
        candidateId: '',
        subject: [],
        used: false
    })

    const [quizLinkDisplayModalOpen, setQuizLinkDisplayModalOpen] = useState<boolean>(false);

    const [showSubjectsModalOpen, setShowSubjectsModalOpen] = useState<boolean>(false);

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    const encryptedJwt = useAppSelector(state => state.auth.jwt);

    const handleRefreshTrigger = () => {
        setRefreshTrigger(prev => !prev);
    }

    const searchCandidatesData = async () => {
        try {
            if (searchValue.trim() === '') {
                setCandidates([])
                setTotalCandidates(0);
                return;
            }

            const response = await searchCandidates(encryptedJwt, searchParam, searchValue, page, rowsPerPage);
            setCandidates(response.listOfCandidates);
            setTotalCandidates(response.totalCandidates);
        }
        catch (error) {
            setCandidates([])
            setTotalCandidates(0);
        }
    }

    useEffect(() => {
        if (open) {
            searchCandidatesData();
        }
        else {
            setSearchParam('id')
            setSearchValue('')
            setCandidates([])
            setPage(0)
            setRowsPerPage(5)
            setTotalCandidates(0)
            setRefreshTrigger(false)
        }

    }, [open, page, rowsPerPage, refreshTrigger])

    const handleSearchParamChange = (e: SelectChangeEvent, _: React.ReactNode) => {
        setSearchParam(e.target.value as string);
        e.target.value === 'subject' ? setSearchValue('APTITUDE') : setSearchValue("");
        setCandidates([])
        setPage(0)
        setRowsPerPage(5)
        setTotalCandidates(0)
    }

    const handleCandidateRefresh = () => {
        handleRefreshTrigger();
        onRefreshActive();
    }


    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xl' fullWidth PaperProps={{ sx: { borderRadius: '0.75rem', boxShadow: 3 } }}>
                <div className="flex items-center justify-between">
                    <div className="text-center w-full">
                        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem' }, fontWeight: 'bold', color: '#1e293b' }}>
                            Search Candidates
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
                    <div className="flex items-center space-x-1 md:space-x-4 mb-4">
                        <Select
                            value={searchParam}
                            onChange={handleSearchParamChange}
                            className='w-full h-10'
                        >
                            <MenuItem value="id">ID</MenuItem>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="phone">Phone</MenuItem>
                            <MenuItem value="subject">Subject</MenuItem>
                        </Select>
                        {
                            searchParam === 'subject' ? (
                                <Select
                                    name='subject'
                                    value={searchValue}
                                    onChange={(e: SelectChangeEvent) => setSearchValue(e.target.value)}
                                    // label="Subject"
                                    className='w-full h-10'
                                >
                                    {
                                        [
                                            "APTITUDE", "JAVA", "ADVANCEJAVA", "PYTHON", "DBMS", "DSA", "COMPUTERS", "NETWROKING",
                                            "WEBDEVELOPMENT", "REACTJS", "TYPESCRIPT", "NEXTJS"
                                        ].map(sub => (
                                            <MenuItem key={sub} value={sub}>
                                                {sub === 'APTITUDE' ? 'Aptitude' : sub === 'JAVA' ? 'Java' : sub === 'ADVANCEJAVA' ? 'Advance Java' : sub === 'PYTHON' ? 'Python' : sub === 'DBMS' ? 'DBMS' : sub === 'DSA' ? 'DSA' : sub === 'COMPUTERS' ? 'Computers' : sub === 'NETWROKING' ? 'Networking' : sub === 'WEBDEVELOPMENT' ? 'Web Development' : sub === 'REACTJS' ? 'ReactJS' : sub === 'TYPESCRIPT' ? 'TypeScript' : sub === 'NEXTJS' ? 'NextJS' : sub}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            ) : (

                                <InputBase
                                    sx={{ flexGrow: 1, border: '1px solid #ccc', borderRadius: '4px', padding: '0 8px' }}
                                    className='w-full h-10'
                                    placeholder={`Search By Candidate's ${searchParam}`}
                                    value={searchValue}
                                    onChange={(e) => searchParam === 'phone' ? setSearchValue(e.target.value.replace(/[^0-9]/g, '')) : setSearchValue(e.target.value)}
                                    type={searchParam === 'email' ? 'email' : searchParam === 'phone' ? 'tel' : 'text'}
                                    inputProps={searchParam === 'phone' ? { maxLength: 10 } : {}}
                                />
                            )
                        }
                        <Button
                            variant='contained'
                            size='large'
                            fullWidth
                            sx={{
                                borderRadius: '6px',
                                bgcolor: "#1e293b",
                                height: '40px',
                                boxShadow: 3,
                                fontWeight: "medium",
                                ":hover": { bgcolor: "#0c1017" }
                            }}
                            onClick={searchCandidatesData}
                        >
                            Search
                        </Button>
                    </div>

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
                        <TableContainer sx={{ maxHeight: rowsPerPage !== 5 ? 350 : 'auto', overflowY: rowsPerPage !== 5 ? 'auto' : 'hidden' }}>
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
                                                    Searching For Candidates...
                                                </TableCell>
                                            </TableRow>
                                        ) : candidates.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: 'center', paddingY: 1.1, color: '#6b7280' }}>
                                                    No candidates found.
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

                                                        <IconButton title='Delete Candidate' sx={{ color: '#1e293b', cursor: 'pointer' }} onClick={async () => await deleteCandidateHandler(encryptedJwt, candidate.id, setErrorMsg, handleCandidateRefresh)}>
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

export default SearchCandidatesModal
