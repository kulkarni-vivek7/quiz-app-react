import { Box, Button, Checkbox, CircularProgress, FormControl, IconButton, InputLabel, ListItemText, MenuItem, Modal, Paper, Select, TextField, Typography, type SelectChangeEvent } from '@mui/material';
import React, { useRef, useState } from 'react'
import { addCandidate, candidateSubjects, type CandidateInput, type CandidateSubject } from '../../../services/candidate/addCandidate';
import { Close as CloseIcon } from '@mui/icons-material';
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SubjectIcon from "@mui/icons-material/Subject";
import { useAppSelector } from '../../../store/hooks';
import AddQuizTimeLimitModal from './AddQuizTimeLimitModal';

type AddCandidateModelProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCandidateAdded: () => void;
}

const subjects = candidateSubjects;

type SubjectCode = CandidateSubject;

const subjectLabelMap: Record<SubjectCode, string> = {
  APTITUDE: 'Aptitude',
  JAVA: 'Java',
  ADVANCEJAVA: 'Advance Java',
  PYTHON: 'Python',
  DBMS: 'DBMS',
  DSA: 'DSA',
  COMPUTERS: 'Computers',
  NETWROKING: 'Networking',
  WEBDEVELOPMENT: 'Web Development',
  REACTJS: 'ReactJS',
  TYPESCRIPT: 'TypeScript',
  NEXTJS: 'NextJS',
};

const getSubjectLabel = (code: SubjectCode) => subjectLabelMap[code] ?? code;

const DEFAULT_SUBJECT: SubjectCode = 'APTITUDE';

const createDefaultFormState = (): CandidateInput => ({
  name: '',
  age: 0,
  email: '',
  phone: '',
  subject: [DEFAULT_SUBJECT],
});

const AddCandidateModal: React.FC<AddCandidateModelProps> = ({ open, setOpen, onCandidateAdded }) => {

  const [formData, setFormData] = useState<CandidateInput>(createDefaultFormState);

  const [savedCandidateId, setSavedCandidateId] = useState<string>("")

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})
  const [formErrorMsg, setFormErrorMsg] = useState<string>("")
  const [successMsg, setSuccessMsg] = useState<string>("")
  const [isRegistering, setIsRegistering] = useState<boolean>(false)
  const [addQuizTimeLimitOpen, setAddQuizTimeLimitOpen] = useState<boolean>(false);

  const timers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({})

  const encryptedJwt = useAppSelector(state => state.auth.jwt);

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
    setFormErrorMsg(msg)

    const timer = setTimeout(() => setFormErrorMsg(""), 2000)

    return () => clearTimeout(timer)
  }

  const showSuccessMsg = (msg: string, callback?: () => void) => {
    setSuccessMsg(msg)
    setTimeout(() => {
      setSuccessMsg("");
      if (callback) callback();
    }, 2000);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val: string | number = value;
    if (name === "age") val = Number(value);
    if (name === 'phone') {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubjectChange = (event: SelectChangeEvent<SubjectCode[]>) => {
    const {
      target: { value, name },
    } = event;

    const selected = Array.isArray(value) ? value : [];
    const uniqueSelection = Array.from(new Set(selected)) as SubjectCode[];

    if (!uniqueSelection.includes(DEFAULT_SUBJECT)) {
      uniqueSelection.unshift(DEFAULT_SUBJECT);
    }

    setFormData(prev => ({
      ...prev,
      [name ?? 'subject']: uniqueSelection,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setFormErrorMsg("")
    setSuccessMsg("")
    setIsRegistering(true)

    const response = await addCandidate(formData, encryptedJwt);
    setIsRegistering(false)

    if (!response.success) {
      const newFormData = { ...formData };

      Object.entries(response.errors).forEach(([field, messages]) => {
        if (field !== 'formErrors' && messages?.length) {
          showFieldError(field, messages);

          switch (field) {
            case "name":
              newFormData.name = ""
              break;
            case "age":
              newFormData.age = 0
              break;
            case "email":
              newFormData.email = ""
              break;
            case "phone":
              newFormData.phone = ""
              break;
            case "subject":
              newFormData.subject = [DEFAULT_SUBJECT]
              break;
            default:
              break;
          }
        }
      });

      setFormData(newFormData);

      if (response.errors.formErrors?.length) {
        showFormError(response.errors.formErrors[0])
      }

      return;
    }

    setSavedCandidateId(response.result?.id || "")

    showSuccessMsg("Candidate Added Successfully!", () => {
      onCandidateAdded();
      setOpen(false);
      setAddQuizTimeLimitOpen(true);
    });
    
    setFormData(createDefaultFormState())
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setFormData(createDefaultFormState())
        }}
        aria-labelledby="add-candidate-modal"
      >
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px' },
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.97)",
            boxShadow: 24,
          }}
        >
          {
            formErrorMsg && (
              <Typography
                variant='subtitle2'
                color='error'
                sx={{ mt: 2, display: 'block', textAlign: 'center' }}
              >
                {formErrorMsg}
              </Typography>
            )
          }

          {
            isRegistering && (
              <CircularProgress
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#1e293b',
                  zIndex: 9999
                }}
              />
            )
          }

          {
            successMsg && (
              <Typography
                align='center'
                color='success.main'
                variant='subtitle1'
                sx={{ fontWeight: "medium" }}
              >
                {successMsg}
              </Typography>
            )
          }
          <div className="flex items-center justify-between">
            <Typography
              variant='h5'
              sx={{ mb: { xs: 3, sm: 3 }, fontWeight: "bold", color: "#1e293b" }}
            >
              Add Candidate
            </Typography>

            <Box sx={{ mb: { xs: 3, sm: 3 } }}
              className='flex items-center justify-end'
            >
              <IconButton
                onClick={() => {
                  setOpen(false)
                  setFormData(createDefaultFormState())
                }}
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

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Name"
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              variant='outlined'
              fullWidth
              required
              error={!!fieldErrors.name}
              helperText={fieldErrors.name ? fieldErrors.name[0] : ""}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: '#1e293b' }} />,
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Age"
              name='age'
              type='number'
              value={formData.age || ""}
              onChange={handleInputChange}
              variant='outlined'
              fullWidth
              required
              error={!!fieldErrors.age}
              helperText={fieldErrors.age ? fieldErrors.age[0] : ""}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Email"
              name='email'
              type='email'
              value={formData.email}
              onChange={handleInputChange}
              variant='outlined'
              fullWidth
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email ? fieldErrors.email[0] : ""}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: '#1e293b' }} />,
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Phone"
              name='phone'
              type='tel'
              value={formData.phone}
              onChange={handleInputChange}
              variant='outlined'
              fullWidth
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone ? fieldErrors.phone[0] : ""}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: '#1e293b' }} />
              }}
              inputProps={{
                maxLength: 10,
                pattern: "[0-9]*",
                inputMode: "numeric"
              }}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth required error={!!fieldErrors.subject} sx={{ mb: 4 }}>
              <InputLabel id="candidate-subjects-label">
                <SubjectIcon sx={{ mr: 1, color: '#1e293b' }} /> Subjects
              </InputLabel>

              <Select
                labelId="candidate-subjects-label"
                name='subject'
                multiple
                value={formData.subject}
                onChange={handleSubjectChange}
                label="Subjects"
                renderValue={(selected) =>
                  (selected as SubjectCode[]).map(getSubjectLabel).join(', ')
                }
              >
                {
                  subjects.map(sub => (
                    <MenuItem key={sub} value={sub}>
                      <Checkbox checked={formData.subject.includes(sub)} />
                      <ListItemText primary={getSubjectLabel(sub)} />
                    </MenuItem>
                  ))
                }
              </Select>
              {
                fieldErrors.subject && (
                  <Typography variant='caption' color='error' sx={{ mt: 1, pl: 1 }}>
                    {fieldErrors.subject[0]}
                  </Typography>
                )
              }
            </FormControl>

            <Button
              type='submit'
              variant='contained'
              size='large'
              fullWidth
              disabled={isRegistering}
              sx={{
                borderRadius: 8,
                bgcolor: "#1e293b",
                boxShadow: 3,
                fontWeight: "medium",
                ":hover": { bgcolor: "#0c1017" }
              }}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Paper>
        {/* </Box> */}
      </Modal>

      <AddQuizTimeLimitModal open={addQuizTimeLimitOpen} setOpen={setAddQuizTimeLimitOpen} candidateId={savedCandidateId} />
    </>
  )
}

export default AddCandidateModal
