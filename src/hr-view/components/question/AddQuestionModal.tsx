import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import React, { useMemo, useRef, useState } from "react";
import { addQuestions, type AddQuestionInput } from "../../../services/question/add-question";
import { useAppSelector } from "../../../store/hooks";

type QuestionTypeOption = "MCQ" | "CODING";

const SUBJECT_VALUES = [
  "APTITUDE",
  "JAVA",
  "ADVANCEJAVA",
  "PYTHON",
  "DBMS",
  "DSA",
  "COMPUTERS",
  "NETWORKING",
  "WEBDEVELOPMENT",
  "REACTJS",
  "TYPESCRIPT",
  "NEXTJS",
] as const;

const DEFAULT_OPTION_COUNT = 4;

const CODING_SUBJECT_VALUES = ["JAVA", "PYTHON", "WEBDEVELOPMENT"] as const;

type McqQuestionInput = Extract<AddQuestionInput, { questionType: "MCQ" }>;
type CodingQuestionInput = Extract<AddQuestionInput, { questionType: "CODING" }>;

type CodingSubject = (typeof CODING_SUBJECT_VALUES)[number];

type AddQuestionModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onQuestionsAdded: () => void;
};

const createEmptyMcq = (): McqQuestionInput => ({
  questionText: "",
  questionType: "MCQ",
  subject: "APTITUDE",
  options: Array.from({ length: DEFAULT_OPTION_COUNT }, () => ""),
  correctOptionIndex: 0,
});

const createEmptyCoding = (): CodingQuestionInput => ({
  questionText: "",
  questionType: "CODING",
  subject: "JAVA",
  starterCode: "",
  testCases: [
    {
      input: "",
      expectedOutput: "",
      isSample: true,
    },
  ],
  language: "java",
});

const getLanguageForSubject = (subject: CodingSubject): string => {
  switch (subject) {
    case "PYTHON":
      return "python";
    case "WEBDEVELOPMENT":
      return "javascript";
    default:
      return "java";
  }
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ open, setOpen, onQuestionsAdded }) => {
  const encryptedJwt = useAppSelector((state) => state.auth.jwt);

  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionTypeOption>("MCQ");
  const [mcqQueue, setMcqQueue] = useState<McqQuestionInput[]>([createEmptyMcq()]);
  const [codingQueue, setCodingQueue] = useState<CodingQuestionInput[]>([createEmptyCoding()]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formErrorMsg, setFormErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const resetState = () => {
    setSelectedQuestionType("MCQ");
    setMcqQueue([createEmptyMcq()]);
    setCodingQueue([createEmptyCoding()]);
    setFieldErrors({});
    setFormErrorMsg("");
    setSuccessMsg("");
  };

  const subjectLabelMap = useMemo<Record<(typeof SUBJECT_VALUES)[number], string>>(() => {
    const toTitle = (token: string) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();

    return SUBJECT_VALUES.reduce((acc, value) => {
      switch (value) {
        case "ADVANCEJAVA":
          acc[value] = "Advance Java";
          break;
        case "WEBDEVELOPMENT":
          acc[value] = "Web Development";
          break;
        case "APTITUDE":
          acc[value] = "Aptitude";
          break;
        case "DBMS":
        case "DSA":
          acc[value] = value;
          break;
        case "COMPUTERS":
          acc[value] = "Computers";
          break;
        case "NETWORKING":
          acc[value] = "Networking";
          break;
        case "REACTJS":
          acc[value] = "ReactJS";
          break;
        case "TYPESCRIPT":
          acc[value] = "TypeScript";
          break;
        case "NEXTJS":
          acc[value] = "NextJS";
          break;
        default:
          acc[value] = toTitle(value.toLowerCase());
      }
      return acc;
    }, {} as Record<(typeof SUBJECT_VALUES)[number], string>);
  }, []);

  const showFieldError = (key: string, messages: string[]) => {
    setFieldErrors((prev) => ({ ...prev, [key]: messages }));
    if (timers.current[key]) clearTimeout(timers.current[key]);

    timers.current[key] = setTimeout(() => {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete timers.current[key];
    }, 2500);
  };

  const showFormMessage = (msg: string) => {
    setFormErrorMsg(msg);
    const timer = setTimeout(() => setFormErrorMsg(""), 2500);
    return () => clearTimeout(timer);
  };

  const showSuccessMessage = (msg: string) => {
    setSuccessMsg(msg);
    const timer = setTimeout(() => {
      setSuccessMsg("");
      setOpen(false);
    }, 2500);
    return () => clearTimeout(timer);
  };

  const getFieldError = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const message = fieldErrors[key]?.[0];
      if (message) {
        return message;
      }
    }
    return undefined;
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as QuestionTypeOption;
    setSelectedQuestionType(value);
  };

  const handleMcqFieldChange = (
    index: number,
    field: keyof McqQuestionInput | `options.${number}`,
    value: string,
  ) => {
    setMcqQueue((prev) => {
      const updated = prev.map((question, idx) => {
        if (idx !== index) return question;

        if (field.startsWith("options.")) {
          const optionIndex = Number(field.split(".")[1]);
          const options = [...question.options];
          options[optionIndex] = value;
          return {
            ...question,
            options,
          };
        }

        if (field === "subject") {
          return {
            ...question,
            subject: value as (typeof question)["subject"],
          };
        }

        if (field === "correctOptionIndex") {
          const parsed = Number(value);
          return {
            ...question,
            correctOptionIndex: Number.isNaN(parsed) ? question.correctOptionIndex : parsed,
          };
        }

        return {
          ...question,
          [field]: value,
        } as typeof question;
      });

      return updated;
    });
  };

  const appendEmptyMcq = () => {
    setMcqQueue((prev) => [...prev, createEmptyMcq()]);
  };

  const removeMcqAt = (index: number) => {
    setMcqQueue((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCodingFieldChange = (
    index: number,
    field: keyof CodingQuestionInput,
    value: string,
  ) => {
    setCodingQueue((prev) =>
      prev.map((question, idx) => {
        if (idx !== index) return question;

        if (field === "subject") {
          const subject = value as CodingSubject;
          return {
            ...question,
            subject,
            language: getLanguageForSubject(subject),
          };
        }

        if (field === "language") {
          return question;
        }

        return {
          ...question,
          [field]: value,
        } as CodingQuestionInput;
      }),
    );
  };

  const handleCodingTestCaseChange = (
    questionIndex: number,
    testCaseIndex: number,
    field: "input" | "expectedOutput" | "isSample",
    value: string,
  ) => {
    setCodingQueue((prev) =>
      prev.map((question, qIdx) => {
        if (qIdx !== questionIndex) return question;

        const nextTestCases = question.testCases.map((testCase, tcIdx) => {
          if (tcIdx !== testCaseIndex) return testCase;

          if (field === "isSample") {
            return {
              ...testCase,
              isSample: value === "true",
            };
          }

          return {
            ...testCase,
            [field]: value,
          };
        });

        return {
          ...question,
          testCases: nextTestCases,
        };
      }),
    );
  };

  const addCodingTestCase = (index: number) => {
    setCodingQueue((prev) =>
      prev.map((question, idx) =>
        idx === index
          ? {
              ...question,
              testCases: [
                ...question.testCases,
                { input: "", expectedOutput: "", isSample: false },
              ],
            }
          : question,
      ),
    );
  };

  const removeCodingTestCase = (questionIndex: number, testCaseIndex: number) => {
    setCodingQueue((prev) =>
      prev.map((question, idx) => {
        if (idx !== questionIndex) return question;

        const nextTestCases = question.testCases.filter((_, tcIdx) => tcIdx !== testCaseIndex);

        return {
          ...question,
          testCases: nextTestCases.length ? nextTestCases : question.testCases,
        };
      }),
    );
  };

  const appendEmptyCoding = () => {
    setCodingQueue((prev) => [...prev, createEmptyCoding()]);
  };

  const removeCodingAt = (index: number) => {
    setCodingQueue((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setFormErrorMsg("");
    setSuccessMsg("");

    setIsSubmitting(true);

    const payload = selectedQuestionType === "MCQ" ? mcqQueue : codingQueue;

    // console.log(payload);

    const result = await addQuestions(payload, encryptedJwt);

    setIsSubmitting(false);

    if (!result.success) {
      Object.entries(result.errors).forEach(([key, messages]) => {
        if (!messages?.length) return;
        showFieldError(key, messages);
      });

      if (result.errors.formErrors?.length) {
        showFormMessage(result.errors.formErrors[0]);
      } else if (result.message) {
        showFormMessage(result.message);
      }

      return;
    }

    showSuccessMessage(result.message ?? "Questions added successfully");
    onQuestionsAdded();
    if (selectedQuestionType === "MCQ") {
      setMcqQueue([createEmptyMcq()]);
    } else {
      setCodingQueue([createEmptyCoding()]);
    }
  };

  const closeModal = () => {
    setOpen(false);
    resetState();
  };

  return (
    <Modal open={open} onClose={closeModal} aria-labelledby="add-question-modal">
      <Paper
        elevation={8}
        className="scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: "640px" },
          maxHeight: "92vh",
          overflowY: "auto",
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.98)",
          boxShadow: 24,
        }}
      >
        {formErrorMsg && (
          <Typography variant="subtitle2" color="error" sx={{ mt: 1, textAlign: "center", fontWeight: 500 }}>
            {formErrorMsg}
          </Typography>
        )}

        {isSubmitting && (
          <CircularProgress
            size={40}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#1e293b",
              zIndex: 20,
            }}
          />
        )}

        {successMsg && (
          <Typography
            variant="subtitle1"
            align="center"
            color="success.main"
            sx={{ fontWeight: 600, mt: 1 }}
          >
            {successMsg}
          </Typography>
        )}

        <Box className="flex items-center justify-between" sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Add Questions
          </Typography>

          <IconButton
            onClick={closeModal}
            sx={{
              color: "#1e293b",
              "&:hover": {
                backgroundColor: "rgba(30, 41, 59, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#1e293b" }}>
              Question Type
            </Typography>
            <RadioGroup
              row
              value={selectedQuestionType}
              onChange={handleRadioChange}
              sx={{ display: "flex", gap: { xs: 2, sm: 4 } }}
            >
              <FormControlLabel value="MCQ" sx={{ color: "#1e293b" }} control={<Radio />} label="MCQ" />
              <FormControlLabel value="CODING" sx={{ color: "#1e293b" }} control={<Radio />} label="Coding" />
            </RadioGroup>
          </FormControl>

          {selectedQuestionType === "MCQ" && (
            <div className="space-y-6">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Add MCQ Question
              </Typography>

              {mcqQueue.map((mcq, index) => {
                const baseKey = `questions.${index}`;
                return (
                  <Paper
                    key={index}
                    elevation={4}
                    className="space-y-4"
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 2,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      backgroundColor: "rgba(248, 250, 252, 0.9)",
                      position: "relative",
                    }}
                  >
                    {mcqQueue.length > 1 && (
                      <IconButton
                        onClick={() => removeMcqAt(index)}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: "#ef4444",
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}>
                      Question {index + 1}
                    </Typography>

                    <TextField
                      label="Question Text"
                      value={mcq.questionText}
                      onChange={(event) =>
                        handleMcqFieldChange(index, "questionText", event.target.value)
                      }
                      multiline
                      minRows={2}
                      fullWidth
                      required
                      error={!!getFieldError(`${baseKey}.questionText`, `${index}.questionText`)}
                      helperText={getFieldError(`${baseKey}.questionText`, `${index}.questionText`)}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth required error={!!fieldErrors[`${baseKey}.subject`]}>
                      <InputLabel id={`subject-label-${index}`}>Subject</InputLabel>
                      <Select
                        labelId={`subject-label-${index}`}
                        value={mcq.subject}
                        label="Subject"
                        onChange={(event: SelectChangeEvent<string>) =>
                          handleMcqFieldChange(index, "subject", event.target.value)
                        }
                        sx={{ mb: 2 }}
                      >
                        {SUBJECT_VALUES.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subjectLabelMap[subject]}
                          </MenuItem>
                        ))}
                      </Select>
                      {getFieldError(`${baseKey}.subject`, `${index}.subject`) && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, pl: 1 }}>
                          {getFieldError(`${baseKey}.subject`, `${index}.subject`)}
                        </Typography>
                      )}
                    </FormControl>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {mcq.options.map((option, optionIndex) => {
                        const optionKey = `${baseKey}.options.${optionIndex}`;
                        return (
                          <TextField
                            key={optionIndex}
                            label={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(event) =>
                              handleMcqFieldChange(index, `options.${optionIndex}`, event.target.value)
                            }
                            fullWidth
                            required
                            error={!!getFieldError(optionKey, `${index}.options.${optionIndex}`)}
                            helperText={getFieldError(optionKey, `${index}.options.${optionIndex}`)}
                          />
                        );
                      })}
                    </div>

                    <TextField
                      label="Correct Option Index"
                      type="number"
                      value={mcq.correctOptionIndex}
                      onChange={(event) =>
                        handleMcqFieldChange(index, "correctOptionIndex", event.target.value)
                      }
                      onKeyDown={(e) => {
                        // Allow only arrow up, arrow down, and tab keys
                        if (![38, 40, 9].includes(e.keyCode)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        // Prevent any direct input
                        e.preventDefault();
                      }}
                      fullWidth
                      required
                      inputProps={{
                        min: 0,
                        max: mcq.options.length - 1,
                        style: { WebkitAppearance: 'textfield' }, // Hide the default number input spinners
                      }}
                      error={!!getFieldError(`${baseKey}.correctOptionIndex`, `${index}.correctOptionIndex`)}
                      helperText={
                        getFieldError(`${baseKey}.correctOptionIndex`, `${index}.correctOptionIndex`) ??
                        "Use up/down arrows to select index between 0 and 3"
                      }
                    />
                  </Paper>
                );
              })}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={appendEmptyMcq}
                sx={{ borderRadius: 3, borderColor: "#1e293b", color: "#1e293b", "&:hover": { borderColor: "#1e293b", color: "#1e293b" } }}
              >
                Add Another MCQ Question
              </Button>
            </div>
          )}

          {selectedQuestionType === "CODING" && (
            <div className="space-y-6">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
                Add CODING Question
              </Typography>

              {codingQueue.map((coding, index) => {
                const baseKey = `questions.${index}`;
                return (
                  <Paper
                    key={`coding-${index}`}
                    elevation={4}
                    className="space-y-4"
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 2,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      backgroundColor: "rgba(248, 250, 252, 0.9)",
                      position: "relative",
                    }}
                  >
                    {codingQueue.length > 1 && (
                      <IconButton
                        onClick={() => removeCodingAt(index)}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: "#ef4444",
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}>
                      Coding Question {index + 1}
                    </Typography>

                    <TextField
                      label="Question Text"
                      value={coding.questionText}
                      onChange={(event) =>
                        handleCodingFieldChange(index, "questionText", event.target.value)
                      }
                      multiline
                      minRows={2}
                      fullWidth
                      required
                      error={!!getFieldError(`${baseKey}.questionText`, `${index}.questionText`)}
                      helperText={getFieldError(`${baseKey}.questionText`, `${index}.questionText`)}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth required error={!!getFieldError(`${baseKey}.subject`, `${index}.subject`)}>
                      <InputLabel id={`coding-subject-label-${index}`}>Subject</InputLabel>
                      <Select
                        labelId={`coding-subject-label-${index}`}
                        value={coding.subject}
                        label="Subject"
                        onChange={(event: SelectChangeEvent<string>) =>
                          handleCodingFieldChange(index, "subject", event.target.value)
                        }
                        sx={{ mb: 2 }}
                      >
                        {CODING_SUBJECT_VALUES.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subjectLabelMap[subject]}
                          </MenuItem>
                        ))}
                      </Select>
                      {getFieldError(`${baseKey}.subject`, `${index}.subject`) && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, pl: 1 }}>
                          {getFieldError(`${baseKey}.subject`, `${index}.subject`)}
                        </Typography>
                      )}
                    </FormControl>

                    <TextField
                      label="Starter Code"
                      value={coding.starterCode}
                      onChange={(event) =>
                        handleCodingFieldChange(index, "starterCode", event.target.value)
                      }
                      multiline
                      minRows={6}
                      fullWidth
                      required
                      sx={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        "& .MuiInputBase-root": {
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        },
                      }}
                      error={!!getFieldError(`${baseKey}.starterCode`, `${index}.starterCode`)}
                      helperText={getFieldError(`${baseKey}.starterCode`, `${index}.starterCode`)}
                      
                    />

                    <div className="space-y-4">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b", mt: 2 }}>
                        Test Cases
                      </Typography>

                      {coding.testCases.map((testCase, tcIndex) => {
                        const tcBaseKey = `${baseKey}.testCases.${tcIndex}`;

                        return (
                          <Paper
                            key={`coding-${index}-testcase-${tcIndex}`}
                            variant="outlined"
                            sx={{
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: 2,
                              borderColor: "rgba(100, 116, 139, 0.35)",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Test Case {tcIndex + 1}
                              </Typography>
                              {coding.testCases.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => removeCodingTestCase(index, tcIndex)}
                                  sx={{ color: "#ef4444" }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <TextField
                                label="Input"
                                value={testCase.input}
                                onChange={(event) =>
                                  handleCodingTestCaseChange(index, tcIndex, "input", event.target.value)
                                }
                                multiline
                                minRows={2}
                                fullWidth
                                required
                                error={!!getFieldError(`${tcBaseKey}.input`, `${index}.testCases.${tcIndex}.input`)}
                                helperText={getFieldError(`${tcBaseKey}.input`, `${index}.testCases.${tcIndex}.input`)}
                              />

                              <TextField
                                label="Expected Output"
                                value={testCase.expectedOutput}
                                onChange={(event) =>
                                  handleCodingTestCaseChange(index, tcIndex, "expectedOutput", event.target.value)
                                }
                                multiline
                                minRows={2}
                                fullWidth
                                required
                                error={!!getFieldError(`${tcBaseKey}.expectedOutput`, `${index}.testCases.${tcIndex}.expectedOutput`)}
                                helperText={
                                  getFieldError(
                                    `${tcBaseKey}.expectedOutput`,
                                    `${index}.testCases.${tcIndex}.expectedOutput`,
                                  )
                                }
                              />
                            </div>

                            <FormControl component="fieldset" sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                                Is Sample Test Case?
                              </Typography>
                              <RadioGroup
                                row
                                value={String(testCase.isSample)}
                                onChange={(event) =>
                                  handleCodingTestCaseChange(index, tcIndex, "isSample", event.target.value)
                                }
                                sx={{ display: "flex", gap: { xs: 2, sm: 4 } }}
                              >
                                <FormControlLabel value="true" control={<Radio />} label="True" />
                                <FormControlLabel value="false" control={<Radio />} label="False" />
                              </RadioGroup>
                            </FormControl>
                          </Paper>
                        );
                      })}

                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => addCodingTestCase(index)}
                        sx={{ borderRadius: 3, borderColor: "#334155", color: "#334155", "&:hover": { borderColor: "#1e293b", color: "#1e293b" } }}
                      >
                        Add Another Test Case
                      </Button>
                    </div>

                    <TextField
                      label="Language"
                      value={coding.language}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      helperText="Language is derived from the selected subject"
                    />
                  </Paper>
                );
              })}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={appendEmptyCoding}
                sx={{ borderRadius: 3, borderColor: "#334155", color: "#334155", "&:hover": { borderColor: "#1e293b", color: "#1e293b" } }}
              >
                Add Another Coding Question
              </Button>
            </div>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            sx={{
              borderRadius: 3,
              bgcolor: "#1e293b",
              fontWeight: 600,
              py: 1.5,
              "&:hover": { bgcolor: "#0f172a" },
            }}
          >
            {isSubmitting
              ? "Adding Questions..."
              : selectedQuestionType === "MCQ"
              ? "Add MCQ Question"
              : "Add CODING Question"}
          </Button>
        </form>
      </Paper>
    </Modal>
  );
};

export default AddQuestionModal;