import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';

import { addQuizTimeLimit } from '../../../services/candidate/addQuizTimeLimit';
import { useAppSelector } from '../../../store/hooks';
import type { EnrollmentResponse } from '../../../types';
import QuizLinkDisplayModal from './QuizLinkDisplayModal';

type AddQuizTimeLimitModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  candidateId: string;
};

const extractMessages = (input: unknown): string[] => {
  if (!input) return [];

  if (typeof input === 'string') {
    return input.trim() ? [input] : [];
  }

  if (Array.isArray(input)) {
    return input.flatMap(extractMessages).filter(Boolean);
  }

  if (typeof input === 'object') {
    return Object.values(input as Record<string, unknown>)
      .flatMap(extractMessages)
      .filter(Boolean);
  }

  return [];
};

const AddQuizTimeLimitModal: React.FC<AddQuizTimeLimitModalProps> = ({ open, setOpen, candidateId }) => {
  const encryptedJwt = useAppSelector((state) => state.auth.jwt);

  const [timeLimitInMinutes, setTimeLimitInMinutes] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formErrorMsg, setFormErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse>(
    {
      candidateId: '',
      subject: [],
      inviteLink: '',
      quizTimeLimit: ''
    }
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAddedTimeLimit, setHasAddedTimeLimit] = useState<boolean>(false);

  const [openQuizLinkDisplayModal, setOpenQuizLinkDisplayModal] = useState<boolean>(false);

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimers = useCallback(() => {
    Object.values(timers.current).forEach((t) => clearTimeout(t));
    timers.current = {};
  }, []);

  const resetState = useCallback(({ keepQuizLinkModalOpen = false } = {}) => {
    setTimeLimitInMinutes('');
    setFieldErrors({});
    setFormErrorMsg('');
    setSuccessMsg('');
    setEnrollmentResponse({
      candidateId: '',
      subject: [],
      inviteLink: '',
      quizTimeLimit: ''
    });
    setIsSubmitting(false);
    setHasAddedTimeLimit(false);
    if (!keepQuizLinkModalOpen) {
      setOpenQuizLinkDisplayModal(false);
    }
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const showFieldError = (field: string, messages: string[]) => {
    setFieldErrors(prev => ({ ...prev, [field]: messages }))
    if (timers.current[field]) clearTimeout(timers.current[field])
    timers.current[field] = setTimeout(() => {
      setFieldErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy;
      })
    }, 2000)
  }

  const showFormError = (msg: string) => {
    setFormErrorMsg(msg);

    if (timers.current.formError) clearTimeout(timers.current.formError);
    timers.current.formError = setTimeout(() => {
      setFormErrorMsg('');
      delete timers.current.formError;
    }, 2000);
  };

  const showSuccessMsg = (msg: string, callback?: () => void) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      if (callback) callback();
    }, 2000);
  };

  const forceClose = useCallback(() => {
    setOpen(false);
    // When closing, we want to reset everything except the quiz link modal state
    resetState({ keepQuizLinkModalOpen: openQuizLinkDisplayModal });
  }, [resetState, setOpen, openQuizLinkDisplayModal]);

  const handleProtectedClose = useCallback(() => {
    if (!hasAddedTimeLimit) {
      showFormError('Cannot close the Modal Without Adding Time Limit');
      return;
    }
    forceClose();
  }, [forceClose, hasAddedTimeLimit]);

  useEffect(() => {
    if (!open) {
      // When the modal is closed directly (not through forceClose), reset everything
      resetState();
    }
  }, [open, resetState]);

  const handleTimeLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D+/g, '');
    setTimeLimitInMinutes(numericValue);
    if (fieldErrors.timeLimitInMinutes) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.timeLimitInMinutes;
        return copy;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFieldErrors({});
    setFormErrorMsg('');
    setSuccessMsg('');

    if (!candidateId) {
      showFormError('Candidate details missing. Please reopen the modal.');
      return;
    }

    if (!timeLimitInMinutes) {
      showFieldError('timeLimitInMinutes', ['Time limit is required']);
      return;
    }

    setIsSubmitting(true);

    const response = await addQuizTimeLimit(encryptedJwt, timeLimitInMinutes, candidateId);

    setIsSubmitting(false);

    if (!response.success) {
      setEnrollmentResponse({
        candidateId: '',
        subject: [],
        inviteLink: '',
        quizTimeLimit: ''
      });

      Object.entries(response.errors ?? {}).forEach(([field, messages]) => {
        if (field === 'formErrors') return;

        const parsedMessages = extractMessages(messages);
        if (parsedMessages.length) {
          showFieldError(field, parsedMessages);
        }
      });

      const formMessages = extractMessages(response.errors?.formErrors);
      if (formMessages.length) {
        showFormError(formMessages[0]);
      }
      return;
    }

    setHasAddedTimeLimit(true);
    setEnrollmentResponse(response.value || {
      candidateId: '',
      subject: [],
      inviteLink: '',
      quizTimeLimit: ''
    });

    showSuccessMsg('Quiz time limit added successfully!\nQuiz Link Will Be Sent To the Candidate\'s Email', () => {
      setOpenQuizLinkDisplayModal(true); // Show the modal first
      forceClose(); // Then close the current modal
    });
  };

  const isSubmitDisabled = !timeLimitInMinutes || !candidateId || isSubmitting;

  return (
    <>

      <Modal
        open={open}
        onClose={(_event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            handleProtectedClose();
          }
        }}
        aria-labelledby="add-quiz-time-limit-modal"
        closeAfterTransition
      >
        <Box className="flex min-h-screen items-center justify-center bg-slate-900/30 p-4">
          <Paper
            elevation={10}
            className="relative mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all sm:max-w-lg sm:p-8"
          >
            {isSubmitting && (
              <Box className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur">
                <CircularProgress size={28} sx={{ color: '#1e293b' }} />
              </Box>
            )}

            {formErrorMsg && (
              <Typography
                variant="body2"
                className="rounded-lg bg-red-50 px-3 py-2 text-center font-medium text-red-600"
                sx={{ marginBottom: '0.75rem' }}
              >
                {formErrorMsg}
              </Typography>
            )}

            {successMsg && (
              <Typography
                variant="subtitle1"
                className="rounded-lg bg-emerald-50 px-3 py-2 text-center font-semibold text-emerald-600"
                sx={{ marginBottom: '0.75rem' }}
              >
                {successMsg}
              </Typography>
            )}

            <div className="mb-6 flex items-start justify-between gap-3">
              <Typography id="add-quiz-time-limit-modal" variant="h5" className="font-bold text-slate-900">
                Add Quiz Time Limit
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleProtectedClose}
                className="text-slate-700 hover:bg-slate-100"
              >
                <CloseIcon />
              </IconButton>
            </div>


            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <TextField
                label="Time Limit (minutes)"
                name="timeLimitInMinutes"
                type="text"
                value={timeLimitInMinutes}
                onChange={handleTimeLimitChange}
                fullWidth
                required
                error={!!fieldErrors.timeLimitInMinutes?.length}
                helperText={fieldErrors.timeLimitInMinutes?.[0] ?? ''}
                InputProps={{
                  startAdornment: <AccessTimeIcon sx={{ mr: 1, color: '#1e293b' }} />,
                  inputMode: 'numeric',
                }}
                inputProps={{
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                  minLength: 1,
                }}
              />

              <Button
                type='submit'
                variant='contained'
                size='large'
                fullWidth
                disabled={isSubmitDisabled}
                sx={{
                  borderRadius: 8,
                  bgcolor: "#1e293b",
                  boxShadow: 3,
                  fontWeight: "medium",
                  ":hover": { bgcolor: "#0c1017" }
                }}
              >
                Add Time Limit
              </Button>
            </form>
          </Paper>
        </Box>
      </Modal>

      <QuizLinkDisplayModal open={openQuizLinkDisplayModal} setOpen={setOpenQuizLinkDisplayModal} quizData={enrollmentResponse} />
    </>
  );
};

export default AddQuizTimeLimitModal;
