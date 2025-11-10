import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, CircularProgress, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Tooltip, Typography } from '@mui/material';
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import type { AnswerSet, PersistedQuizState, QuestionType } from '../../types';
import { getQuestionsByToken } from '../../query/get-questions-by-token';
import { findCandidateByToken } from '../../query/find-all-candidates';
import { submitAnswerSets } from '../../services/addAnswersSets';
import QuizComplete from './QuizComplete';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearQuizState, saveQuizState } from '../../store/quizSlice';
import { decryptData } from '../../cryptoUtils';


const QuizApp: React.FC = () => {

    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [CandidateId, setCandidateId] = useState<string>('');
    const [currentQuestion, setCurrectQuestion] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [quizTimeLimitLabel, setQuizTimeLimitLabel] = useState<string>('');
    const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isTimerFrozen, setIsTimerFrozen] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const quizEntries = useAppSelector((state) => state.quiz.entries);
    const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
    const encryptedQuizState = token ? quizEntries[token] ?? null : null;
    const initializeRef = useRef(false);

    useEffect(() => {

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        setToken(token ?? '');

    }, [])


    useEffect(() => {
        if (token === '' || initializeRef.current) {
            return;
        }

        const setupQuiz = async () => {
            let restoredState: PersistedQuizState | null = null;

            if (!hasAttemptedRestore && encryptedQuizState) {
                restoredState = decryptData<PersistedQuizState>(encryptedQuizState);

                if (!restoredState) {
                    dispatch(clearQuizState(token));
                }

                setHasAttemptedRestore(true);
            }

            if (restoredState) {
                setQuestions(restoredState.questions ?? []);
                setCandidateId(restoredState.candidateId ?? '');
                const maxIndex = Math.max(restoredState.questions.length - 1, 0);
                const safeIndex = Math.min(Math.max(restoredState.currentQuestion ?? 0, 0), maxIndex);
                setCurrectQuestion(safeIndex);
                const wasSubmitted = Boolean(restoredState.submitted);
                setSubmitted(wasSubmitted);
                if (restoredState.quizTimeLimitLabel) {
                    setQuizTimeLimitLabel(restoredState.quizTimeLimitLabel);
                }
                if (restoredState.quizEndTime) {
                    setQuizEndTime(restoredState.quizEndTime);
                }
                setIsTimerFrozen(wasSubmitted);
                initializeRef.current = true;
                return;
            }

            const res1 = await getQuestionsByToken(token);

            if (res1.success) {
                const normalizedQuestions = res1.result.questions.map((question: QuestionType) => {
                    if (question.questionType !== 'CODING') {
                        return question;
                    }

                    const normalizedStarter = (question.starterCode ?? '').replace(/\\n/g, '\n');

                    return {
                        ...question,
                        starterCode: normalizedStarter,
                        candidateCode: normalizedStarter,
                    };
                });

                setQuestions(normalizedQuestions);
                const timeLabel = res1.result.quizTimeLimit ?? '';
                setQuizTimeLimitLabel(timeLabel);
                const extractedMinutes = extractMinutesFromLabel(timeLabel);
                if (extractedMinutes > 0) {
                    const endTime = Date.now() + extractedMinutes * 60 * 1000;
                    setQuizEndTime(endTime);
                } else {
                    setQuizEndTime(null);
                }
                setIsTimerFrozen(false);
            }
            else {
                setErrorMsg(res1.message);
                initializeRef.current = true;
                return;
            }

            const res2 = await findCandidateByToken(token);

            if (res2.success) {
                setCandidateId(res2.result.id);
            }
            else {
                setErrorMsg(res2.message);
            }

            initializeRef.current = true;
        };

        setupQuiz();
    }, [dispatch, encryptedQuizState, hasAttemptedRestore, token]);

    useEffect(() => {
        if (token === '' || !CandidateId) {
            return;
        }

        if (questions.length === 0 && !submitted) {
            return;
        }

        const stateToPersist: PersistedQuizState = {
            candidateId: CandidateId,
            questions,
            currentQuestion,
            submitted,
            quizTimeLimitLabel,
            quizEndTime,
        };

        dispatch(saveQuizState({ token, state: stateToPersist }));
    }, [CandidateId, currentQuestion, dispatch, questions, submitted, token, quizEndTime, quizTimeLimitLabel]);

    const handleOptionChange = (index: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            if (next[currentQuestion]?.questionType === 'MCQ') {
                next[currentQuestion] = {
                    ...next[currentQuestion],
                    chosenOptionIndex: index,
                };
            }
            return next;
        })
    }

    const getLanguageForQuestion = useCallback((question: QuestionType): string => {
        switch (question.subject) {
            case 'JAVA':
                return 'java';
            case 'PYTHON':
                return 'python';
            case 'WEBDEVELOPMENT':
                return 'javascript';
            default:
                return question.language ?? 'plaintext';
        }
    }, []);

    const handleCodeChange = useCallback((value: string | undefined) => {
        setQuestions((prev) => {
            const next = [...prev];
            if (next[currentQuestion]?.questionType === 'CODING') {
                next[currentQuestion] = {
                    ...next[currentQuestion],
                    candidateCode: value ?? '',
                };
            }
            return next;
        });
    }, [currentQuestion]);

    useEffect(() => {
        const activeQuestion = questions[currentQuestion];
        if (!activeQuestion || activeQuestion.questionType !== 'CODING') {
            return;
        }

        if (activeQuestion.candidateCode === undefined) {
            setQuestions((prev) => {
                const next = [...prev];
                const normalizedStarter = (activeQuestion.starterCode ?? '').replace(/\\n/g, '\n');
                next[currentQuestion] = {
                    ...next[currentQuestion],
                    candidateCode: normalizedStarter,
                };
                return next;
            });
        }
    }, [currentQuestion, questions]);

    const goPrev = () => setCurrectQuestion((c) => Math.max(c - 1, 0));
    const goNext = () => setCurrectQuestion((c) => Math.min(c + 1, questions.length - 1));

    const formattedRemainingTime = useMemo(() => {
        if (remainingTime === null) {
            return quizTimeLimitLabel || '';
        }

        const totalSeconds = Math.floor(remainingTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [quizTimeLimitLabel, remainingTime]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) {
            return;
        }

        setIsTimerFrozen(true);
        let timeTaken = '';
        
        if (quizEndTime) {
            const diff = Math.max(0, quizEndTime - Date.now());
            setRemainingTime(diff);
            
            // Calculate time taken (total time - remaining time)
            const totalMinutes = extractMinutesFromLabel(quizTimeLimitLabel);
            const totalTimeMs = totalMinutes * 60 * 1000; // Convert minutes to milliseconds
            const timeTakenMs = totalTimeMs - diff;
            
            // Format time taken as "X mins" (e.g., "20 mins")
            const minutes = Math.ceil(timeTakenMs / 60000); // Round up to the nearest minute
            timeTaken = `${minutes} min${minutes !== 1 ? 's' : ''}`;
        }

        setIsSubmitting(true);
        const output: AnswerSet = {
            candidateId: CandidateId,
            answers: questions.map((q) => ({
                questionId: q.questionId,
                questionType: q.questionType,
                chosenOptionIndex: q.questionType === 'MCQ' ? q.chosenOptionIndex ?? -1 : undefined,
                candidateCode: q.questionType === 'CODING' ? (q.candidateCode ?? '') : undefined,
                language: q.questionType === 'CODING' ? getLanguageForQuestion(q) : undefined,
            })),
            timeTaken: timeTaken || '0 mins' // Default value if time calculation fails
        };

        const response = await submitAnswerSets(token, output);

        if (response.success) {
            setSubmitted(true);
            setQuizEndTime(null);
            setRemainingTime(null);
            dispatch(clearQuizState(token));
            return;
        }

        setIsSubmitting(false);
        setIsTimerFrozen(false);
    }, [CandidateId, dispatch, getLanguageForQuestion, isSubmitting, questions, quizEndTime, token]);

    useEffect(() => {
        if (!quizEndTime) {
            setRemainingTime(null);
            return;
        }

        if (isTimerFrozen) {
            return;
        }

        const computeDiff = () => Math.max(0, quizEndTime - Date.now());
        let intervalId: number;

        const updateRemainingTime = () => {
            const diff = computeDiff();
            setRemainingTime(diff);
            if (diff === 0) {
                window.clearInterval(intervalId);
                void handleSubmit();
            }
        };

        updateRemainingTime();
        intervalId = window.setInterval(updateRemainingTime, 1000);

        return () => window.clearInterval(intervalId);
    }, [handleSubmit, isTimerFrozen, quizEndTime]);

    if (submitted) {
        return (
            <QuizComplete />
        )
    }

    if ((!CandidateId || questions.length === 0) && !errorMsg) {
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
                    <CircularProgress
                        size={48}
                        thickness={4}
                        sx={{
                            color: '#1e293b',
                            mb: 2
                        }}
                    />
                    <Typography variant='h6' sx={{ mb: 1, color: '#1e293b' }}>
                        Loading Quiz...
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Please wait while we prepare your quiz.
                    </Typography>
                </Paper>
            </Box>
        )
    }

    if (errorMsg) {
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
                    <Typography variant='h6' sx={{ mb: 1, color: '#1e293b' }}>
                        Error
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        {errorMsg}
                    </Typography>
                </Paper>
            </Box>
        )
    }

    const q = questions[currentQuestion];
    const isCodingQuestion = q?.questionType === 'CODING';
    const activeLanguage = q && isCodingQuestion ? getLanguageForQuestion(q) : 'plaintext';
    const sampleTestCases = isCodingQuestion
        ? (q?.sampleTestCases ?? q?.testCases ?? []).filter((testCase) => Boolean(testCase?.isSample))
        : [];

    const quizTimerBanner = quizEndTime
        ? (
            <Box
                className="flex w-full flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm sm:flex-row"
            >
                <div className="flex items-center gap-2">
                    <AccessTimeFilledIcon sx={{ color: '#0f172a' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Time Remaining
                    </Typography>
                </div>
                <Tooltip title={quizTimeLimitLabel || 'Quiz duration'} arrow>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: 2,
                            color: remainingTime !== null && remainingTime < 5 * 60 * 1000 ? '#dc2626' : '#1e293b',
                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                        }}
                    >
                        {formattedRemainingTime}
                    </Typography>
                </Tooltip>
            </Box>
        )
        : null;

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
                    maxWidth: isCodingQuestion ? 920 : 480,
                    p: { xs: 3, sm: 5 },
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(255,255,255,0.92)",
                    boxShadow: 4,
                    position: 'relative',
                }}
            >
                {quizTimerBanner && (
                    <Box className="mb-4">{quizTimerBanner}</Box>
                )}
                {isSubmitting && (
                    <CircularProgress
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#1e293b',
                            zIndex: 10,
                        }}
                    />
                )}
                <Typography
                    variant='h5'
                    sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main', mb: 4 }}
                >
                    {q?.subject === 'APTITUDE' ? 'Aptitude' : q?.subject === 'JAVA' ? 'Java' : q?.subject === 'ADVANCEJAVA' ? 'Advance Java' : q?.subject === 'PYTHON' ? 'Python' : q?.subject === 'DBMS' ? 'DBMS' : q?.subject === 'DSA' ? 'DSA' : q?.subject === 'COMPUTERS' ? 'Computers' : q?.subject === 'NETWROKING' ? 'Networking' : q?.subject === 'WEBDEVELOPMENT' ? 'Web Development' : q?.subject === 'REACTJS' ? 'ReactJS' : q?.subject === 'TYPESCRIPT' ? 'TypeScript' : q?.subject === 'NEXTJS' ? 'NextJS' : 'Unknown'} Questions
                </Typography>
                <Typography
                    variant='h6'
                    sx={{
                        fontWeight: 'medium',
                        minHeight: 60,
                        mb: 4,
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                    }}
                >
                    {`Q${currentQuestion + 1}. ${q?.questionText}`}
                </Typography>

                {q?.questionType === 'MCQ' && (
                    <FormControl component={'fieldset'} sx={{ mb: 4, width: "100%" }}>
                        <RadioGroup
                            value={q?.chosenOptionIndex !== undefined ? q?.chosenOptionIndex : null}
                            onChange={(e) => handleOptionChange(Number(e.target.value))}
                        >
                            {
                                q?.options?.map((opt, idx) => (
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
                )}

                {isCodingQuestion && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                p: { xs: 2.5, sm: 3 },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#1e293b' }}>
                                Write Your Solution
                            </Typography>
                            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #cbd5f5' }}>
                                <Editor
                                    height="360px"
                                    language={activeLanguage}
                                    theme="vs-dark"
                                    value={q?.candidateCode ?? ''}
                                    onChange={handleCodeChange}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        padding: { top: 16 },
                                    }}
                                />
                            </Box>
                            {sampleTestCases.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Typography variant='subtitle2' sx={{ fontWeight: 600, color: '#1e293b', mt: 1 }}>
                                        Sample Test Cases
                                    </Typography>
                                    {sampleTestCases.map((testCase, idx) => (
                                        <Box
                                            key={`${q?.questionId ?? 'question'}-sample-${idx}`}
                                            sx={{
                                                borderRadius: 2,
                                                border: '1px solid #cbd5f5',
                                                backgroundColor: '#fff',
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: '#334155' }}>
                                                Sample {idx + 1}
                                            </Typography>
                                            <Box>
                                                <Typography variant='caption' sx={{ fontWeight: 600, color: '#475569' }}>
                                                    Input
                                                </Typography>
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        backgroundColor: '#0f172a',
                                                        color: '#e2e8f0',
                                                        borderRadius: 1.5,
                                                        p: 1.5,
                                                        fontSize: '0.85rem',
                                                        lineHeight: 1.6,
                                                        fontFamily: 'Fira Code, monospace',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        overflowX: 'auto',
                                                    }}
                                                >
                                                    {testCase?.input?.trim() || '// No sample input provided'}
                                                </Box>
                                                <Typography variant='caption' sx={{ color: '#64748b' }}>
                                                    String type Input
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant='caption' sx={{ fontWeight: 600, color: '#475569' }}>
                                                    Expected Output
                                                </Typography>
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        backgroundColor: '#0f172a',
                                                        color: '#e2e8f0',
                                                        borderRadius: 1.5,
                                                        p: 1.5,
                                                        fontSize: '0.85rem',
                                                        lineHeight: 1.6,
                                                        fontFamily: 'Fira Code, monospace',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        overflowX: 'auto',
                                                    }}
                                                >
                                                    {testCase?.expectedOutput?.trim() || '// No expected output provided'}
                                                </Box>
                                                <Typography variant='caption' sx={{ color: '#64748b' }}>
                                                    {testCase?.expectedOutput === 'true' || testCase?.expectedOutput === 'false' ? 'Boolean' : 'String'} type Output
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}

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
                                disabled={isSubmitting}
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
                                disabled={q?.questionType === 'MCQ' && q?.chosenOptionIndex === undefined}
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
                                disabled={(q?.questionType === 'MCQ' && q?.chosenOptionIndex === undefined) || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        )
                    }
                </Box>
            </Paper>
        </Box>
    )
}

export default QuizApp

const extractMinutesFromLabel = (label: string): number => {
    if (!label) return 0;
    const match = label.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    return Math.floor(Number(match[1]));
};