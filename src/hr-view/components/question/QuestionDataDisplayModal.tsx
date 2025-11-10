import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Modal,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import type { SvgIconProps } from '@mui/material';
import React, { useMemo } from 'react';
import type { QuestionType } from '../../../types';

type QuestionDataDisplayModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  question: QuestionType;
};

const PythonIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 32 32">
    <path
      fill="#3776AB"
      d="M14.222 0c-1.77.003-3.104.162-4.183.439C7.12 1.077 6.334 2.361 6.334 4.58v2.515h7.78v1.568H4.577c-2.238 0-4.112 1.35-4.712 3.92-.686 2.861-.715 4.655 0 7.654.546 2.278 2.173 3.917 4.412 3.917h2.85v-2.99c0-2.568 2.23-4.82 4.8-4.82h7.76c2.13 0 3.838-1.553 3.838-3.69V4.58c0-2.129-1.75-3.733-3.837-4.534C18.442.065 16.714 0 14.222 0Zm-4.3 3.023c.797 0 1.448.657 1.448 1.47 0 .81-.65 1.467-1.449 1.467-.8 0-1.448-.657-1.448-1.468 0-.81.648-1.469 1.447-1.469Z"
    />
    <path
      fill="#FFD343"
      d="M31.502 10.663c-.57-2.245-1.985-3.92-4.115-3.92h-2.85v3.018c0 2.734-2.312 4.785-4.8 4.785H12.1c-2.095 0-3.838 1.599-3.838 3.69v5.887c0 2.129 1.796 3.38 3.838 3.917 2.429.715 4.765.845 7.76 0 1.935-.56 3.838-1.688 3.838-3.917v-2.515h-7.76v-1.568h11.762c2.238 0 3.072-1.56 3.838-3.917.8-2.4.766-4.71 0-7.47Zm-9.482 13.303c.799 0 1.448.657 1.448 1.467 0 .81-.65 1.47-1.448 1.47-.799 0-1.449-.66-1.449-1.47 0-.81.65-1.467 1.45-1.467Z"
    />
  </SvgIcon>
);

const JavaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 48">
    <path
      d="M22 6c3 3 2 6-2 9-4 3-2 5 4 6"
      fill="none"
      stroke="#E76F00"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M28 16c2 1 4 3 4 5 0 3-5 4.2-5 6.7 0 1.3 2.2 2.5 5 1.5"
      fill="none"
      stroke="#5382A1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M16 26s2 1.7 8 1.7 8-1.7 8-1.7"
      fill="none"
      stroke="#5382A1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M16 34c-4.5 1-8 2.7-8 4.7 0 3.5 30 3.5 30 0 0-2-4.8-3.7-9.5-4.6"
      fill="none"
      stroke="#5382A1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </SvgIcon>
);

const JavaScriptIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 48">
    <rect width="42" height="42" x="3" y="3" rx="6" fill="#F7DF1E" />
    <path
      fill="#1F2937"
      d="M22 18v14.5c0 3.2-1.7 4.9-4.8 4.9-2.3 0-3.9-1-5-2.6l2.5-1.6c.5.7 1.1 1.3 2.3 1.3 1.1 0 1.7-.6 1.7-1.9V18Z"
    />
    <path
      fill="#1F2937"
      d="M25.5 32.6 28 31c.7 1.1 1.6 1.8 2.9 1.8 1.2 0 2-.6 2-1.5 0-1-.7-1.4-2.2-1.9l-.8-.3c-2.3-.8-3.7-2-3.7-4.6 0-2.3 1.8-4 4.5-4 2 0 3.4.7 4.4 2.5l-2.4 1.6c-.5-.9-1-1.3-2-1.3s-1.4.6-1.4 1.3c0 .9.6 1.3 1.9 1.8l.8.3c2.6 1 4 2.3 4 4.7 0 2.7-2 4.2-4.9 4.2-2.7 0-4.5-1.3-5.8-3.1Z"
    />
  </SvgIcon>
);

const QuestionDataDisplayModal: React.FC<QuestionDataDisplayModalProps> = ({ open, setOpen, question }) => {
  const closeModal = () => setOpen(false);

  const { optionsToRender, correctOptionValue } = useMemo(() => {
    const mcqOptions = question.options ?? [];
    const limitedOptions = mcqOptions.slice(0, 4);
    const hasValidIndex =
      question.correctOptionIndex !== undefined &&
      typeof question.correctOptionIndex === 'number' &&
      question.correctOptionIndex >= 0 &&
      question.correctOptionIndex < mcqOptions.length;
    const correctIndex = hasValidIndex ? (question.correctOptionIndex as number) : undefined;

    return {
      optionsToRender: limitedOptions,
      correctOptionValue: typeof correctIndex === 'number' ? mcqOptions[correctIndex] : undefined,
    };
  }, [question]);

  const isMcq = question.questionType === 'MCQ';
  const isCoding = question.questionType === 'CODING';
  const languageLabel = question.language ? question.language.toUpperCase() : 'N/A';
  const starterCode = isCoding && typeof question.starterCode === 'string' ? question.starterCode : '';
  const codingTestCases = isCoding && Array.isArray(question.testCases) ? question.testCases : [];

  const languageChipConfig = useMemo(() => {
    if (!isCoding) {
      return undefined;
    }

    const normalized = (question.language ?? '').toLowerCase();

    const buildConfig = (icon: React.ReactElement, palette: { bg: string; color: string }) => ({
      icon,
      sx: {
        px: 1.75,
        py: 0.5,
        borderRadius: '9999px',
        backgroundColor: palette.bg,
        color: palette.color,
        '& .MuiChip-icon': {
          color: palette.color,
          fontSize: 20,
          marginLeft: -0.25,
          marginRight: 0.5,
        },
        '& .MuiChip-label': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    });

    switch (normalized) {
      case 'python':
        return buildConfig(<PythonIcon fontSize="small" />, {
          bg: '#E0F2FE',
          color: '#1D4ED8',
        });
      case 'java':
        return buildConfig(<JavaIcon fontSize="small" />, {
          bg: '#E0F2F1',
          color: '#0F766E',
        });
      case 'javascript':
      case 'js':
        return buildConfig(<JavaScriptIcon fontSize="small" />, {
          bg: '#FEF3C7',
          color: '#92400E',
        });
      default:
        return buildConfig(<CodeIcon fontSize="small" />, {
          bg: '#EDE9FE',
          color: '#5B21B6',
        });
    }
  }, [isCoding, question.language]);

  return (
    <Modal open={open} onClose={closeModal} aria-labelledby="question-details-title">
      <Box className="flex min-h-screen items-center justify-center bg-slate-900/40 p-4" sx={{ outline: 'none' }}>
        <Paper elevation={3} className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl">
          <Box className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <Box>
              <Typography id="question-details-title" variant="h6" className="font-semibold text-slate-900">
                Question Details
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                {isMcq ? 'Multiple Choice Question' : question.questionType}
              </Typography>
            </Box>
            <IconButton onClick={closeModal} aria-label="Close question details">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
            <Box className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <Box className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <Box className="space-y-1">
                  <Typography variant="subtitle2" className="uppercase tracking-wide text-slate-500">
                    Subject
                  </Typography>
                  <Chip label={question.subject ?? 'N/A'} className="bg-blue-50 text-blue-700" />
                </Box>
                {languageChipConfig && (
                  <Box className="space-y-1">
                    <Typography variant="subtitle2" className="uppercase tracking-wide text-slate-500">
                      Language
                    </Typography>
                    <Chip
                      icon={languageChipConfig.icon}
                      label={languageLabel}
                      className="font-medium"
                      sx={languageChipConfig.sx}
                    />
                  </Box>
                )}
              </Box>
              <Box className="hidden text-sm font-medium text-slate-500 sm:block">
                ID: <span className="font-semibold text-slate-700">{question.questionId ?? '—'}</span>
              </Box>
            </Box>

            <Divider className="border-slate-200" />

            <Box className="space-y-3">
              <Typography variant="subtitle1" className="font-semibold text-slate-800">
                Question
              </Typography>
              <Typography variant="body1" className="text-base leading-relaxed text-slate-700">
                {question.questionText}
              </Typography>
            </Box>

            {isMcq && optionsToRender.length > 0 && (
              <Box className="space-y-4">
                <Typography variant="subtitle1" className="font-semibold text-slate-800">
                  Options
                </Typography>

                <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {optionsToRender.map((option, index) => {
                    const isCorrectOption = option === correctOptionValue;
                    return (
                      <Paper
                        key={`${option}-${index}`}
                        variant="outlined"
                        className={`flex h-full items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-150 sm:items-center ${
                          isCorrectOption
                            ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {index + 1}
                        </Box>
                        <Typography variant="body1" className="flex-1 text-slate-700">
                          {option}
                        </Typography>
                        {isCorrectOption && (
                          <CheckCircleIcon fontSize="small" className="mt-1 text-emerald-500 sm:mt-0" />
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            )}

            {isMcq && (
              <Box className="space-y-2">
                <Typography variant="subtitle1" className="font-semibold text-slate-800">
                  Correct Answer
                </Typography>
                <Box className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                  <CheckCircleIcon fontSize="small" />
                  <Typography variant="body1" className="font-medium">
                    {correctOptionValue ?? 'Correct option not provided'}
                  </Typography>
                </Box>
              </Box>
            )}

            {isCoding && (
              <Box className="space-y-6">
                <Box className="space-y-3">
                  <Box className="flex items-center gap-3">
                    <CodeIcon fontSize="small" className="text-slate-500" />
                    <Typography variant="subtitle1" className="font-semibold text-slate-800">
                      Starter Code
                    </Typography>
                  </Box>
                  <Paper variant="outlined" className="overflow-hidden rounded-2xl border border-slate-200">
                    <Box className="max-h-80 overflow-auto bg-slate-900/95">
                      <Typography
                        component="pre"
                        variant="body2"
                        className="whitespace-pre-wrap break-words px-5 py-4 text-sm text-slate-100"
                        sx={{ fontFamily: 'Fira Code, Consolas, Menlo, monospace' }}
                      >
                        {starterCode && starterCode.trim().length > 0 ? starterCode : 'Starter code not provided.'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                <Box className="space-y-3">
                  <Box className="flex items-center gap-3">
                    <FactCheckIcon fontSize="small" className="text-slate-500" />
                    <Typography variant="subtitle1" className="font-semibold text-slate-800">
                      Test Cases
                    </Typography>
                  </Box>

                  {codingTestCases.length > 0 ? (
                    <Box className="space-y-3">
                      {codingTestCases.map((testCase, index) => {
                        const isSampleCase = Boolean(testCase.isSample);
                        return (
                          <Paper
                            key={`${testCase.input}-${index}`}
                            variant="outlined"
                            className="space-y-4 rounded-2xl border border-slate-200 px-5 py-4"
                          >
                            <Box className="flex flex-wrap items-center justify-between gap-2">
                              <Typography variant="subtitle2" className="font-semibold text-slate-700">
                                Test Case {index + 1}
                              </Typography>
                              <Chip
                                size="small"
                                label={isSampleCase ? 'Sample Case' : 'Evaluation Case'}
                                className={
                                  isSampleCase
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }
                                sx={{ '& .MuiChip-label': { fontWeight: 500 } }}
                              />
                            </Box>

                            <Divider className="border-slate-100" />

                            <Box className="grid gap-4 sm:grid-cols-2">
                              <Box className="space-y-2">
                                <Typography variant="body2" className="uppercase tracking-wide text-slate-500">
                                  Input
                                </Typography>
                                <Typography
                                  component="pre"
                                  variant="body2"
                                  className="whitespace-pre-wrap break-words rounded-xl bg-slate-100 px-4 py-2 font-mono text-slate-700"
                                >
                                  {testCase.input || '—'}
                                </Typography>
                              </Box>
                              <Box className="space-y-2">
                                <Typography variant="body2" className="uppercase tracking-wide text-slate-500">
                                  Expected Output
                                </Typography>
                                <Typography
                                  component="pre"
                                  variant="body2"
                                  className="whitespace-pre-wrap break-words rounded-xl bg-slate-100 px-4 py-2 font-mono text-slate-700"
                                >
                                  {testCase.expectedOutput || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  ) : (
                    <Paper variant="outlined" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                      <Typography variant="body2" className="text-slate-600">
                        No test cases provided.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default QuestionDataDisplayModal;
