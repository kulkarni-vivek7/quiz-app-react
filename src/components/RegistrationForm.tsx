import React, { useRef, useState } from 'react'
import { enrollStudent, type StudentInput } from '../services/registerStudent';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography, type SelectChangeEvent } from '@mui/material';
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SubjectIcon from "@mui/icons-material/Subject";
import { useNavigate } from 'react-router-dom';

const subjects = [
    "JAVA", "ADVANCEJAVA", "PYTHON", "DBMS", "DSA", "COMPUTERS", "NETWROKING",
    "WEBDEVELOPMENT", "REACTJS", "TYPESCRIPT", "NEXTJS"
];


const RegistrationForm = () => {

    const [formData, setFormData] = useState<StudentInput>({
        name: "",
        age: 0,
        email: "",
        phone: "",
        subject: ""
    })

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})
    const [formErrorMsg, setFormErrorMsg] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");
    const timers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

    const navigate = useNavigate()

    const showFieldError = (field: string, messages: string[]) => {
        setFieldErrors(prev => ({ ...prev, [field]: messages }));
        if (timers.current[field]) clearTimeout(timers.current[field]);
        timers.current[field] = setTimeout(() => {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            })
        }, 2000);
    }

    const showFormError = (msg: string) => {
        setFormErrorMsg(msg);
        setTimeout(() => setFormErrorMsg(""), 2000);
    }

    const showSuccessMsg = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => {
            setSuccessMsg("")
            navigate("/quiz")
        }, 2000);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let val: string | number = value;
        if (name === "age") val = Number(value);
        setFormData(prev => ({
            ...prev,
            [name]: val,
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setFormErrorMsg("");
        setSuccessMsg("");

        // console.log(formData);

        const response = await enrollStudent(formData);

        // console.log(response.result);
        
        if (!response.success) {
            const newFormData = { ...formData };

            Object.entries(response.errors).forEach(([field, messages]) => {
                if (field !== "formErrors" && messages?.length) {

                    showFieldError(field, messages);

                    switch (field) {
                        case "name":
                            newFormData.name = "";
                            break;
                        case "age":
                            newFormData.age = 0;
                            break;
                        case "email":
                            newFormData.email = "";
                            break;
                        case "phone":
                            newFormData.phone = "";
                            break;
                        case "subject":
                            newFormData.subject = "";
                            break;
                        default:
                            break;
                    }
                }
            });

            setFormData(newFormData);

            if (response.errors.formErrors?.length) {
                showFormError(response.errors.formErrors[0]);
            }

            return;
        }

        sessionStorage.setItem("studentEmail", formData.email);
        sessionStorage.setItem("quizQuestions", JSON.stringify(response.result))

        // Success Handling
        showSuccessMsg("Student Registered Successfully");
        setFormData({
            name: "",
            age: 0,
            email: "",
            phone: "",
            subject: ""
        })
    }

    return (
        <Box className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#1e293b]">
            <Paper
                elevation={8}
                sx={{
                    width: "100%",
                    maxWidth: 480,
                    p: { xs: 3, sm: 5 },
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(255,255,255,0.97)",
                    boxShadow: 3
                }}
            >
                {
                    successMsg && (
                        <Typography
                            align='center'
                            color='success.main'
                            variant='subtitle1'
                            sx={{ mb: 3, fontWeight: "medium" }}
                        >
                            {successMsg}
                        </Typography>
                    )
                }
                <Typography
                    variant='h4'
                    align='center'
                    sx={{ mb: { xs: 3, sm: 4 }, fontWeight: "bold", color: "primary.main" }}
                >
                    Student Register
                </Typography>

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
                            startAdornment: <PersonIcon color='primary' sx={{ mr: 1 }} />,
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
                            startAdornment: <EmailIcon color='primary' sx={{ mr: 1 }} />,
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
                            startAdornment: <PhoneIcon color='primary' sx={{ mr: 1 }} />,
                        }}
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth required error={!!fieldErrors.subject} sx={{ mb: 4 }}>
                        <InputLabel>
                            <SubjectIcon color='primary' sx={{ mr: 1 }} /> Subject
                        </InputLabel>

                        <Select
                            name='subject'
                            value={formData.subject}
                            onChange={handleSelectChange}
                            label="Subject"
                        >
                            {
                                subjects.map(sub => (
                                    <MenuItem key={sub} value={sub}>
                                        {sub}
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
                        sx={{
                            borderRadius: 8,
                            bgcolor: "primary.main",
                            boxShadow: 3,
                            fontWeight: "medium",
                            ":hover": { bgcolor: "primary.dark" }
                        }}
                    >
                        Register
                    </Button>
                    {
                        formErrorMsg && (
                            <Typography
                                variant='caption'
                                color='error'
                                sx={{ mt: 2, display: 'block', textAlign: 'left' }}
                            >
                                {formErrorMsg}
                            </Typography>
                        )
                    }
                </form>

            </Paper>
        </Box>

    )
}

export default RegistrationForm