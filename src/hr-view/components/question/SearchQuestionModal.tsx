import React, { useEffect, useState } from 'react'
import type { QuestionType } from '../../../types'
import { useAppSelector } from '../../../store/hooks'
import { searchQuestions } from '../../../query/find-all-questions'
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputBase, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, type SelectChangeEvent } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material';
import { formatSubjectName } from '../../../services/candidate/formatSubjectName'
import QuestionDataDisplayModal from './QuestionDataDisplayModal'

type SearchQuestionModalPros = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchQuestionModal: React.FC<SearchQuestionModalPros> = ({ open, setOpen }) => {

  const [searchParam, setSearchParam] = useState<string>("questionId")
  const [searchValue, setSearchValue] = useState<string>("")
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)

  const [openQuestionDataDisplayModal, setOpenQuestionDataDisplayModal] = useState<boolean>(false);

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>({} as QuestionType);

  const encryptedJwt = useAppSelector((state) => state.auth.jwt);

  const searchQuestionsData = async () => {
    try {
      if (searchValue.trim() === '') {
        setQuestions([])
        setTotalQuestions(0)
        return;
      }

      const response = await searchQuestions(encryptedJwt, searchParam, searchValue, page, rowsPerPage);
      setQuestions(response.listOfQuestions)
      setTotalQuestions(response.totalQuestions)
    }
    catch (error) {
      setQuestions([])
      setTotalQuestions(0)
    }
  }

  useEffect(() => {
    if (open) {
      searchQuestionsData();
    }
    else {
      setSearchParam('questionId')
      setSearchValue('')
      setQuestions([])
      setPage(0)
      setRowsPerPage(10)
      setTotalQuestions(0)
    }

  }, [open, page, rowsPerPage])

  const handleSearchParamChange = (e: SelectChangeEvent, _: React.ReactNode) => {
    setSearchParam(e.target.value as string);
    e.target.value === 'subject' ? setSearchValue('APTITUDE') : e.target.value === 'questionType' ? setSearchValue('MCQ') : setSearchValue("");
    setQuestions([])
    setPage(0)
    setRowsPerPage(10)
    setTotalQuestions(0)
  }


  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xl' fullWidth PaperProps={{ sx: { borderRadius: '0.75rem', boxShadow: 3 } }}>
        <div className="flex items-center justify-between">
          <div className="text-center w-full">
            <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem' }, fontWeight: 'bold', color: '#1e293b' }}>
              Search Questions
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
              <MenuItem value="questionId">Question ID</MenuItem>
              <MenuItem value="questionText">Question Text</MenuItem>
              <MenuItem value="subject">Subject</MenuItem>
              <MenuItem value="questionType">Question Type</MenuItem>
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
              ) : searchParam === 'questionType' ? (
                <Select
                  name='questionType'
                  value={searchValue}
                  onChange={(e: SelectChangeEvent) => setSearchValue(e.target.value)}
                  // label="Subject"
                  className='w-full h-10'
                >
                  {
                    [
                      "MCQ", "CODING"
                    ].map(sub => (
                      <MenuItem key={sub} value={sub}>
                        {sub === 'MCQ' ? 'Mcq' : sub === 'CODING' ? 'Coding' : sub}
                      </MenuItem>
                    ))
                  }
                </Select>
              ) : (
                <InputBase
                  sx={{ flexGrow: 1, border: '1px solid #ccc', borderRadius: '4px', padding: '0 8px' }}
                  className='w-full h-10'
                  placeholder={`Search By ${searchParam.substring(0, 'question'.length).charAt(0).toUpperCase() + searchParam.substring(0, 'question'.length).slice(1) + " " + searchParam.substring('question'.length)}`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  type='text'
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
              onClick={searchQuestionsData}
            >
              Search
            </Button>
          </div>

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
                          Searching For Questions...
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
              rowsPerPageOptions={[10, 30, 50, 70]}
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

        </DialogContent>
      </Dialog>

      <QuestionDataDisplayModal open={openQuestionDataDisplayModal} setOpen={setOpenQuestionDataDisplayModal} question={selectedQuestion} />
    </>
  )
}

export default SearchQuestionModal
