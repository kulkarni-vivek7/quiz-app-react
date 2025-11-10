import React, { useMemo } from 'react'

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Card, CardActions, CardContent, Paper, Typography, Modal, IconButton, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { AnswerSetResponse, AnswerDTO } from '../../types';

// Extend AnswerDTO to include starterCode for coding questions
type ExtendedAnswerDTO = AnswerDTO & {
    starterCode?: string;
    questionType?: 'MCQ' | 'CODING';
    candidateCode?: string;
    chosenOptionIndex?: number;
};

import { formatSubjectName } from '../../services/candidate/formatSubjectName';

type ResultProps = {
    open: boolean;
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    answerSetData: AnswerSetResponse;
}


const QuizResultModal: React.FC<ResultProps> = ({ open, onClose, answerSetData }) => {
    const derivedCorrectCount = answerSetData.answers.filter(
        (q) => q.correct
    ).length;

    const correctCount = answerSetData.correctAnswers ?? derivedCorrectCount;
    const totalQuestions = answerSetData.totalQuestions ?? answerSetData.answers.length;
    
    // Check if quiz was not completed within time limit
    const isQuizIncomplete = useMemo(() => {
        const answers = answerSetData.answers as ExtendedAnswerDTO[];
        
        // Check if any MCQ question was not answered
        const hasUnansweredMCQ = answers.some(
            q => q.questionType === 'MCQ' && q.chosenOptionIndex === -1
        );

        // Check if any coding question has the same code as starter code
        const hasUnchangedCode = answers.some(
            q => q.questionType === 'CODING' && 
                 q.candidateCode && 
                 q.starterCode && 
                 q.candidateCode.trim() === q.starterCode.trim()
        );

        return hasUnansweredMCQ || hasUnchangedCode;
    }, [answerSetData.answers]);

    // Format time taken with completion status and total time limit if available
    const formattedTimeTaken = useMemo(() => {
        if (isQuizIncomplete) {
            return `${answerSetData.timeTaken} - Quiz not completed within given time`;
        }
        
        // If all questions are answered and we have the quiz time limit
        if (answerSetData.quizTimeLimit) {
            return `${answerSetData.timeTaken} out of ${answerSetData.quizTimeLimit}`;
        }
        
        return answerSetData.timeTaken;
    }, [answerSetData.timeTaken, answerSetData.quizTimeLimit, isQuizIncomplete]);

    return (
        <Modal
            open={open}
            onClose={() => onClose(false)}
            aria-labelledby="quiz-result-modal"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: '800px' },
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                {/* Header with Title and Close Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography
                        id="quiz-result-modal"
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 'bold',
                            color: '#1e293b'
                        }}
                    >
                        Quiz Result Summary
                    </Typography>
                    <IconButton
                        onClick={() => onClose(false)}
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
                                    Candidate Name
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {answerSetData.candidateName}
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
                                    Subject
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {
                                        answerSetData.subjectName.map((subject) => formatSubjectName(subject)).join(', ')
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
                                    Score
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontWeight: 600,
                                            color: correctCount === totalQuestions ? 'success.main' : 'error.main'
                                        }}
                                    >
                                        {`${correctCount} out of ${totalQuestions} questions correct`}
                                    </Typography>
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
                                    Time Taken
                                </TableCell>
                                <TableCell
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {formattedTimeTaken}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Questions Grid */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        color: '#1e293b'
                    }}
                >
                    Detailed Results
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {
                        answerSetData.answers.map((q, index) => {
                            const isCodingQuestion = q.questionType === 'CODING';
                            const correctAnswer = !isCodingQuestion ? q.options?.[q.correctOptionIndex ?? -1] : undefined;
                            const chosenAnswer = !isCodingQuestion ? q.options?.[q.chosenOptionIndex ?? -1] : undefined;

                            const answeredCorrectly = (() => {
                                if (isCodingQuestion) {
                                    return Boolean(q.correct);
                                }

                                if (typeof q.correct === 'boolean') {
                                    return q.correct;
                                }

                                return q.correctOptionIndex === q.chosenOptionIndex;
                            })();

                            return (
                                <Grid size={{ xs: 12, sm: 6 }} key={q.questionId}>
                                    <Card
                                        variant='outlined'
                                        sx={{
                                            height: '100%',
                                            borderColor: answeredCorrectly ? "success.main" : "error.main",
                                            '&:hover': {
                                                boxShadow: 2,
                                            }
                                        }}
                                    >
                                        <CardContent>
                                            <Typography
                                                variant='subtitle1'
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 2,
                                                    color: '#1e293b'
                                                }}
                                            >
                                                Q{index + 1}: {q.questionText}
                                            </Typography>
                                            {
                                                !isCodingQuestion ? (
                                                    <>
                                                        <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
                                                            <strong>Correct Answer:</strong> {correctAnswer ?? '—'}
                                                        </Typography>
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                mb: 1,
                                                                color: answeredCorrectly ? "success.main" : "error.main"
                                                            }}
                                                        >
                                                            <strong>Your Answer:</strong> {chosenAnswer ?? '—'}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {(q.passedTestCases !== undefined && q.totalTestCases !== undefined) && (
                                                                <Typography variant='body2' sx={{ color: answeredCorrectly ? 'success.main' : 'error.main' }}>
                                                                    Passed {q.passedTestCases} / {q.totalTestCases} test cases
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Typography variant='caption' sx={{ color: '#64748b' }}>
                                                            Candidate Code:
                                                        </Typography>
                                                        <Box
                                                            component="pre"
                                                            sx={{
                                                                backgroundColor: '#0f172a',
                                                                color: '#e2e8f0',
                                                                borderRadius: 2,
                                                                p: 2,
                                                                fontSize: '0.85rem',
                                                                lineHeight: 1.6,
                                                                fontFamily: 'Fira Code, monospace',
                                                                overflowX: 'auto',
                                                                maxHeight: 240,
                                                            }}
                                                        >
                                                            {q.candidateCode || '// No code submitted'}
                                                        </Box>
                                                        {q.testResults && q.testResults.length > 0 && (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                                <Typography variant='body2' sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                    Test Results
                                                                </Typography>
                                                                {q.testResults.map((result, idx) => {
                                                                    const trimmed = result.trim();
                                                                    const passed = trimmed.startsWith('✓');
                                                                    const resultColor = answeredCorrectly ? '#15803d' : (passed ? '#15803d' : '#b91c1c');
                                                                    const resultBackground = answeredCorrectly ? '#ecfdf5' : (passed ? '#ecfdf5' : '#fef2f2');
                                                                    return (
                                                                        <Typography
                                                                            key={`${q.questionId}-result-${idx}`}
                                                                            variant='body2'
                                                                            sx={{
                                                                                fontFamily: 'Fira Code, monospace',
                                                                                color: resultColor,
                                                                                backgroundColor: resultBackground,
                                                                                borderRadius: 1.5,
                                                                                px: 1.5,
                                                                                py: 0.75,
                                                                                wordBreak: 'break-word',
                                                                            }}
                                                                        >
                                                                            {result}
                                                                        </Typography>
                                                                    );
                                                                })}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )
                                            }
                                        </CardContent>

                                        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                            {
                                                answeredCorrectly ? (
                                                    <CheckCircleIcon color='success' />
                                                ) : (
                                                    <CancelIcon color='error' />
                                                )
                                            }
                                        </CardActions>
                                    </Card>
                                </Grid>
                            )
                        })
                    }
                </Grid>
            </Box>
        </Modal>
    )
}

export default QuizResultModal