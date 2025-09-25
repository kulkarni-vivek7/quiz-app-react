import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { findStudentByEmail } from '../query/find-student-by-email';
import { Box, Button, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Typography } from '@mui/material';
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitAnswerSets, type AnswerSet } from '../services/addAnswersSets';
import QuizResult from './QuizResult';

export type QuestionType = {
    questionId: string;
    questionText: string;
    options: string[];
    subject: string;
    chosenOptionIndex?: number;
}

const QuizApp: React.FC = () => {

    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [studentId, setStudentId] = useState<string>('');
    const [studentName, setStudentName] = useState<string>('');
    const [currentQuestion, setCurrectQuestion] = useState<number>(0);
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [answerSet, setAnswerSet] = useState<AnswerSet>({
        studentId: '',
        questions: []
    })

    useEffect(() => {
        const initialSetup = async () => {
            const questionsStr = sessionStorage.getItem('quizQuestions');
            const studentEmailStr = sessionStorage.getItem('studentEmail');

            if (!studentEmailStr || !questionsStr) {
                navigate("/", { replace: true });
                return;
            }

            const response = await findStudentByEmail(studentEmailStr);

            setQuestions(JSON.parse(questionsStr));
            setStudentId(response.id);
            setStudentName(response.name);
        }

        initialSetup();
    }, [navigate])

    // useEffect(() => {
    //     return () => {
    //         localStorage.removeItem("quizQuestions");
    //         localStorage.removeItem("studentEmail");
    //     };
    // }, []);

    const handleOptionChange = (index: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[currentQuestion].chosenOptionIndex = index;
            sessionStorage.setItem('quizQuestions', JSON.stringify(next));
            return next;
        })
    }

    const goPrev = () => setCurrectQuestion((c) => Math.max(c - 1, 0));
    const goNext = () => setCurrectQuestion((c) => Math.min(c + 1, questions.length - 1));

    const handleSubmit = async () => {
        const output: AnswerSet = {
            studentId,
            questions: questions.map((q) => ({
                ...q,
                chosenOptionIndex: q.chosenOptionIndex ?? -1,
            }))
        };

        const response = await submitAnswerSets(output);

        if (response.success) {
            setSubmitted(true);
            setAnswerSet(response.values)
        }
    }

    if (submitted) {
        return (
            <QuizResult
                questions={answerSet.questions}
                studentName={studentName}
                onRegisterAgain={() => {
                    sessionStorage.clear();
                    navigate('/')
                }}
            />
        )
    }

    if (!studentId || questions.length === 0) {

        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1e293b',
                    px: 2
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 5,
                        maxWidth: 400,
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                >
                    <CheckCircleIcon color='primary' sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant='h5' sx={{ mb: 2 }}>
                        Please Register To Start The Quiz!
                    </Typography>
                    <Typography variant='body1'>
                        The Quiz Will Appear Here After Registration
                    </Typography>
                </Paper>
            </Box>
        )
    }

    const q = questions[currentQuestion];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1e293b",
                px: 2,
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    width: "100%",
                    maxWidth: 480,
                    p: { xs: 3, sm: 5 },
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(255,255,255,0.92)",
                    boxShadow: 4,
                }}
            >
                <Typography
                    variant='h5'
                    sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main', mb: 4 }}
                >
                    Quiz On {q.subject}
                </Typography>
                <Typography
                    variant='h6'
                    sx={{ fontWeight: 'medium', minHeight: 60, mb: 4 }}
                >
                    {`Q${currentQuestion + 1}. ${q.questionText}`}
                </Typography>

                <FormControl component={'fieldset'} sx={{ mb: 4, width: "100%" }}>
                    <RadioGroup
                        value={q.chosenOptionIndex !== undefined ? q.chosenOptionIndex : null}
                        onChange={(e) => handleOptionChange(Number(e.target.value))}
                    >
                        {
                            q.options.map((opt, idx) => (
                                <FormControlLabel
                                    key={idx}
                                    value={idx}
                                    control={
                                        <Radio
                                            color='primary'
                                            sx={{
                                                ".Mui-checked": { color: "#2563eb" },
                                                mx: 1,
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{
                                                fontSize: { xs: "1rem", sm: "1.1rem" },
                                                pl: 1,
                                                py: 0.5,
                                            }}
                                        >
                                            {opt}
                                        </Typography>
                                    }
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                        bgcolor: "#f3f4f6",
                                        "&:hover": { backgroundColor: "#dbeafe" },
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                />
                            ))
                        }
                    </RadioGroup>
                </FormControl>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 2,
                        flexWrap: "wrap",
                    }}
                >
                    {
                        currentQuestion !== 0 && (
                            <Button
                                variant='outlined'
                                color='primary'
                                size='large'
                                sx={{ minWidth: 110, fontWeight: "bold", borderRadius: 2 }}
                                startIcon={<KeyboardArrowLeftIcon />}
                                onClick={goPrev}
                            >
                                Previous
                            </Button>
                        )
                    }

                    {
                        currentQuestion < questions.length - 1 && (
                            <Button
                                variant='contained'
                                color='primary'
                                size='large'
                                endIcon={<KeyboardArrowRightIcon />}
                                sx={{ minWidth: 110, fontWeight: 'bold', borderRadius: 2 }}
                                onClick={goNext}
                                disabled={q.chosenOptionIndex === undefined}
                            >
                                Next
                            </Button>
                        )
                    }

                    {
                        currentQuestion === questions.length - 1 && (
                            <Button
                                variant='contained'
                                color='success'
                                size='large'
                                sx={{ minWidth: 110, fontWeight: 'bold', borderRadius: 2 }}
                                onClick={handleSubmit}
                                disabled={q.chosenOptionIndex === undefined}
                            >
                                Submit
                            </Button>
                        )
                    }
                </Box>
            </Paper>
        </Box>
    )
}

export default QuizApp