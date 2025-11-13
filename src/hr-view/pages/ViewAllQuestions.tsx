import React, { useEffect, useState } from 'react'
import { type QuestionType } from '../../types'
import { useAppSelector } from '../../store/hooks';
import { findAllQuestions } from '../../query/find-all-questions';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import AddQuestionModal from '../components/question/AddQuestionModal';
import QuestionDataDisplayModal from '../components/question/QuestionDataDisplayModal';
import { formatSubjectName } from '../../services/candidate/formatSubjectName';
import SearchQuestionModal from '../components/question/SearchQuestionModal';

const ViewAllQuestions = () => {

    const [questions, setQuestions] = useState<QuestionType[] | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(25);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

    const [openAddQuestionModal, setOpenAddQuestionModal] = useState<boolean>(false);

    const [openQuestionDataDisplayModal, setOpenQuestionDataDisplayModal] = useState<boolean>(false);

    const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>({} as QuestionType);

    const [openSearchQuestionModal, setOpenSearchQuestionModal] = useState<boolean>(false);

    const encryptedJwt = useAppSelector((state) => state.auth.jwt);

    const handleRefreshTrigger = () => {
        setRefreshTrigger(prev => !prev);
    }

    const fetchQuestions = async () => {
        try {

            const response = await findAllQuestions(encryptedJwt, page, rowsPerPage);
            setQuestions(response.listOfQuestions);
            setTotalQuestions(response.totalQuestions);
        }
        catch (error) {
            setQuestions([])
            console.error("Failed to fetch questions: ", error);

        }
    }

    useEffect(() => {
        fetchQuestions();
    }, [page, rowsPerPage, refreshTrigger])

    return (
        <>
            <div className="bg-[#dfe7f8] relative min-h-screen pt-15">
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                    <h1 className="text-3xl text-center mb-6 text-[#1e293b] font-bold">
                        All Questions
                    </h1>

                    <Paper sx={{ marginBottom: 4, padding: 1, boxShadow: 3, borderRadius: '0.5rem', backgroundColor: 'white', overflowX: 'auto' }}>
                        <TableContainer sx={{ maxHeight: 350, overflowY: 'auto' }}>
                            <Table stickyHeader aria-label="questions table" sx={{ minWidth: '100%' }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e5e7eb' }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto', } }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto', } }}>Question Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto', } }}>Subject</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto', } }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        questions === null || questions === undefined ? (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: 'center', paddingY: 1.1, color: '#6b7280' }}>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : questions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: 'center', paddingY: 1.1, color: '#6b7280' }}>
                                                    No questions found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            questions.map((question) => (
                                                <TableRow key={question.questionId} sx={{ borderBottom: '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f9fafb' } }}>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{question.questionId}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{question.questionType}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{formatSubjectName(question.subject)}</TableCell>
                                                    <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>
                                                        <Button variant='contained' size='large' fullWidth
                                                            sx={{
                                                                borderRadius: 8,
                                                                bgcolor: "#1e293b",
                                                                boxShadow: 3,
                                                                fontWeight: "medium",
                                                                ":hover": { bgcolor: "#0c1017" }
                                                            }}
                                                            onClick={() => { setSelectedQuestion(question); setOpenQuestionDataDisplayModal(true) }}
                                                        >
                                                            View Question Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[25, 50, 75, 100]}
                            component={'div'}
                            count={totalQuestions}
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
                            showFirstButton
                            showLastButton
                        />
                    </Paper>

                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button className='bg-[#1e293b] hover:bg-[#0c1017] text-white px-4 py-2 rounded-md font-bold shadow-md transition duration-300 ease-in-out w-full sm:w-auto cursor-pointer'
                            onClick={() => setOpenAddQuestionModal(true)}>
                            Add Question
                        </button>
                        <button className='bg-[#1e293b] hover:bg-[#0c1017] text-white px-4 py-2 rounded-md font-bold shadow-md transition duration-300 ease-in-out w-full sm:w-auto cursor-pointer'
                            onClick={() => setOpenSearchQuestionModal(true)}>
                            Search Question
                        </button>
                    </div>
                </div>
            </div>

            <AddQuestionModal open={openAddQuestionModal} setOpen={setOpenAddQuestionModal} onQuestionsAdded={handleRefreshTrigger} />
            <QuestionDataDisplayModal open={openQuestionDataDisplayModal} setOpen={setOpenQuestionDataDisplayModal} question={selectedQuestion} />
            <SearchQuestionModal open={openSearchQuestionModal} setOpen={setOpenSearchQuestionModal} />
        </>
    )
}

export default ViewAllQuestions
