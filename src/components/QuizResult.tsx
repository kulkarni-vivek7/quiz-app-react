import React from 'react'

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Box, Button, Card, CardActions, CardContent, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

type QuestionType = {
    questionId: string;
    questionText: string;
    options: string[];
    subject: string;
    chosenOptionIndex?: number;
    correctOptionIndex?: number;
}

type ResultProps = {
    questions: QuestionType[];
    studentName: string;
    onRegisterAgain: () => void;
}


const QuizResult: React.FC<ResultProps> = ({ questions, studentName, onRegisterAgain }) => {

    const correctCount = questions.filter(
        (q) => q.correctOptionIndex === q.chosenOptionIndex
    ).length;

    return (
        <Box
            className="min-h-screen flex flex-col items-center bg-[#1e293b] p-4 sm:p-8"
        >
            <Paper
                elevation={10}
                className='max-w-5xl w-full rounded-xl shadow-xl bg-white bg-opacity-95 overflow-y-auto max-h-[90vh] p-6 sm:p-10'
            >
                <Typography variant='h4' className='text-center font-bold text-blue-700 pb-2'>
                    Quiz Result Summary
                </Typography>

                <Grid container spacing={2}>
                    {
                        questions.map((q, index) => {
                            const correctAnswer = q.options[q.correctOptionIndex ?? -1];
                            const chosenAnswer = q.options[q.chosenOptionIndex ?? -1];
                            const answeredCorrectly = q.correctOptionIndex === q.chosenOptionIndex;
                            return (
                                <Grid size={{ xs: 12, sm: 6 }} key={q.questionId}>
                                    <Card
                                        variant='outlined'
                                        className='h-full flex flex-col'
                                        sx={{ borderColor: answeredCorrectly ? "green" : "red" }}
                                    >
                                        <CardContent className='flex-grow'>
                                            <Typography
                                                variant='subtitle1'
                                                className='font-semibold mb-4 text-gray-900'
                                            >
                                                Q{index + 1}: {q.questionText}
                                            </Typography>
                                            <Typography variant='body2' className='mb-2 text-gray-700'>
                                                <strong>Correct Answer</strong> {correctAnswer}
                                            </Typography>
                                            <Typography variant='body2' className='mb-2' color={answeredCorrectly ? "green" : "error"}>
                                                <strong>Your Answer</strong> {chosenAnswer}
                                            </Typography>
                                        </CardContent>

                                        <CardActions className='justify-end'>
                                            {
                                                answeredCorrectly ? (
                                                    <CheckCircleIcon className='success' />
                                                ) : (
                                                    <CancelIcon className='error' />
                                                )

                                            }
                                        </CardActions>
                                    </Card>
                                </Grid>
                            )
                        })
                    }
                </Grid>
                <div className='mt-10'>
                    <Typography variant='h6' className='text-center  font-bold'>
                        {`${studentName} has answered ${correctCount} out of ${questions.length} questions correctly.`}
                    </Typography>
                </div>

                <Box className="flex justify-center mt-8">
                    <Button
                        variant="outlined"
                        startIcon={<KeyboardArrowLeftIcon />}
                        onClick={onRegisterAgain}
                        size="large"
                        sx={{ borderRadius: 12, px: 6 }}
                        className="text-blue-700 hover:text-white hover:bg-blue-600 transition"
                    >
                        Register
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
}

export default QuizResult