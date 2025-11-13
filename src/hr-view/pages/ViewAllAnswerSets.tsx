import React, { useEffect, useState } from 'react'
import { type AnswerSetResponse, type Candidate } from '../../types'
import { useAppSelector } from '../../store/hooks';
import { findAnswerSetsByCandidateId } from '../../query/find-all-answer-sets';
import { findAllQuizCompletedCandidates } from '../../query/find-all-candidates';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import QuizResultModal from '../../candidate-quiz/components/QuizResultModal';
import ShowSubjectsModal from '../components/candidate/ShowSubjectsModal';

const ViewAllAnswerSets = () => {

  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalCandidates, setTotalCandidates] = useState<number>(0);

  const [showSubjectsModalOpen, setShowSubjectsModalOpen] = useState<boolean>(false);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const [answerSetData, setAnswerSetData] = useState<AnswerSetResponse>({
    candidateName: '',
    subjectName: [],
    answers: [],
    timeTaken: '',
    totalQuestions: 0,
    correctAnswers: 0,
  })

  const [quizResultModalOpen, setQuizResultModalOpen] = useState<boolean>(false);

  const encryptedJwt = useAppSelector((state) => state.auth.jwt);

  const constructAnswerSetData = async (candidateId: string, candidateName: string, subjectName: string[]) => {

    try {
      const res = await findAnswerSetsByCandidateId(encryptedJwt, candidateId);

      setAnswerSetData({
        candidateName,
        subjectName,
        answers: res.answers,
        timeTaken: res.timeTaken,
        totalQuestions: res.totalQuestions,
        correctAnswers: res.correctAnswers,
        quizTimeLimit: res.quizTimeLimit
      })

      setQuizResultModalOpen(true)

    }
    catch (error) {
      console.error("Failed to fetch answer set data: ", error);
    }
  }

  const fetchCandidates = async () => {
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
    fetchCandidates();
  }, [page, rowsPerPage])


  return (
    <>
      <div className="bg-[#dfe7f8] relative min-h-screen pt-15">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <h1 className='text-3xl text-center mb-6 text-[#1e293b] font-bold'>
            All Answer Sets
          </h1>

          <Paper sx={{ marginBottom: 4, padding: 1, boxShadow: 3, borderRadius: '0.5rem', backgroundColor: 'white', overflowX: 'auto' }}>
            <TableContainer sx={{ maxHeight: 350, overflowY: 'auto' }}>
              <Table stickyHeader aria-label="Answer Set table" sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e5e7eb' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Candidate Id</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Candidate Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>Subject Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', paddingY: 1.1, paddingX: 2, textAlign: 'center', width: { xs: '25%', sm: 'auto' } }}>View Answer Set</TableCell>
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
                          No Answer Sets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate) => (
                        <TableRow key={candidate.id} sx={{ borderBottom: '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f9fafb' } }}>
                          <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.id}</TableCell>
                          <TableCell sx={{ paddingY: 1.1, paddingX: 2, textAlign: 'center' }}>{candidate.name}</TableCell>
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
                            <Button variant='contained' size='large' fullWidth
                              sx={{
                                borderRadius: 8,
                                bgcolor: "#1e293b",
                                boxShadow: 3,
                                fontWeight: "medium",
                                ":hover": { bgcolor: "#0c1017" }
                              }}
                              onClick={async () => await constructAnswerSetData(candidate.id, candidate.name, candidate.subject)}
                            >
                              View Answer Set
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
              showFirstButton
              showLastButton
            />
          </Paper>
        </div>
      </div>

      <QuizResultModal open={quizResultModalOpen} onClose={setQuizResultModalOpen} answerSetData={answerSetData} />
      <ShowSubjectsModal open={showSubjectsModalOpen} setOpen={setShowSubjectsModalOpen} subjects={selectedSubjects} />
    </>
  )
}

export default ViewAllAnswerSets
