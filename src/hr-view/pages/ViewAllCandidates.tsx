import React, { useEffect, useState } from 'react'
import { type EnrollmentResponse, type Candidate, type QuizInvite } from '../../types'
import { useAppSelector } from '../../store/hooks';
import { findAllCandidates } from '../../query/find-all-candidates';
import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import AddCandidateModal from '../components/candidate/AddCandidateModal';
import LinkIcon from '@mui/icons-material/Link';
import QuizLinkDisplayModal from '../components/candidate/QuizLinkDisplayModal';
import { constructQuizLinkResponse } from '../../services/quiz/construct-quiz-link';
import SearchCandidatesModal from '../components/candidate/SearchCandidatesModal';
import ShowSubjectsModal from '../components/candidate/ShowSubjectsModal';
import ViewAllQuizCompletedCandidatesModal from './ViewAllQuizCompletedCandidatesModal';

const ViewAllCandidates = () => {

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

  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState<boolean>(false);

  const [searchCandidateModalOpen, setSearchCandidateModalOpen] = useState<boolean>(false);

  const [viewAllQuizCompletedCandidatesModalOpen, setViewAllQuizCompletedCandidatesModalOpen] = useState<boolean>(false);

  const handleRefreshTrigger = () => {
    setRefreshTrigger(prev => !prev);
  }

  const fetchQuizPendingCandidates = async () => {
    try {

      const response = await findAllCandidates(encryptedJwt, page, rowsPerPage);
      setCandidates(response.listOfCandidates);
      setTotalCandidates(response.totalCandidates);

    }
    catch (error) {
      setCandidates([])
      console.error("Faild to fetch candidates: ", error);

    }
  }

  useEffect(() => {
    fetchQuizPendingCandidates();
  }, [page, rowsPerPage, refreshTrigger])

  return (
    <>
      <div className="bg-[#dfe7f8] relative min-h-screen pt-15">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <h1 className='text-3xl text-center mb-6 text-[#1e293b] font-bold'>
            Quiz Pending Candidates
          </h1>

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
                          No quiz pending candidates found.
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

          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button className='bg-[#1e293b] hover:bg-[#0c1017] text-white px-4 py-2 rounded-md font-bold shadow-md transition duration-300 ease-in-out w-full sm:w-auto cursor-pointer'
              onClick={() => setAddCandidateModalOpen(true)}>
              Register Candidate
            </button>
            <button className='bg-[#1e293b] hover:bg-[#0c1017] text-white px-4 py-2 rounded-md font-bold shadow-md transition duration-300 ease-in-out w-full sm:w-auto cursor-pointer'
              onClick={() => setViewAllQuizCompletedCandidatesModalOpen(true)}>
              View Quiz Completed Candidates
            </button>
            <button className='bg-[#1e293b] hover:bg-[#0c1017] text-white px-4 py-2 rounded-md font-bold shadow-md transition duration-300 ease-in-out w-full sm:w-auto cursor-pointer'
              onClick={() => setSearchCandidateModalOpen(true)}>
              Search Candidate
            </button>
          </div>

        </div>
      </div>

      <AddCandidateModal open={addCandidateModalOpen} setOpen={setAddCandidateModalOpen} onCandidateAdded={handleRefreshTrigger} />
      <QuizLinkDisplayModal open={quizLinkDisplayModalOpen} setOpen={setQuizLinkDisplayModalOpen} quizData={enrollmentResponse} isQuizInviteUsed={quizInvite.used} />
      <SearchCandidatesModal open={searchCandidateModalOpen} setOpen={setSearchCandidateModalOpen} onRefreshActive={handleRefreshTrigger} />
      <ShowSubjectsModal open={showSubjectsModalOpen} setOpen={setShowSubjectsModalOpen} subjects={selectedSubjects} />
      <ViewAllQuizCompletedCandidatesModal open={viewAllQuizCompletedCandidatesModalOpen} setOpen={setViewAllQuizCompletedCandidatesModalOpen} />
    </>
  )
}

export default ViewAllCandidates
