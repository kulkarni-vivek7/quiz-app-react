import React, { useRef, useState } from 'react'
import { registerHr, type HrInput } from '../services/loginAndRegister/register'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

const Register = () => {

  const [formData, setFormData] = useState<HrInput>({
    name: "",
    email: "",
    phone: ""
  })

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})
  const [formErrorMsg, setFormErrorMsg] = useState<string>("")
  const [successMsg, setSuccessMsg] = useState<string>("")

  const timers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({})

  const navigate = useNavigate()

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
    const timer = setTimeout(() => setFormErrorMsg(""), 2000)

    return () => clearTimeout(timer)
  }

  const showSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    const timer = setTimeout(() => {
      setSuccessMsg("")
      navigate("/")
    }, 2000)

    return () => clearTimeout(timer)

  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let val = value;
    if (name === 'phone') {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFieldErrors({})
    setFormErrorMsg("")
    setSuccessMsg("")

    // console.log(formData)

    const response = await registerHr(formData)

    if (!response.success) {

      const newFormData = { ...formData };

      Object.entries(response.errors).forEach(([field, messages]) => {

        if (field !== 'formErrors' && messages?.length) {

          showFieldError(field, messages)

          switch (field) {
            case "name":
              newFormData.name = ""
              break;
            case "email":
              newFormData.email = ""
              break;
            case "phone":
              newFormData.phone = ""
              break;
            default:
              break;
          }
        }
      });

      setFormData(newFormData)

      if (response.errors.formErrors?.length) {
        showFormError(response.errors.formErrors[0])
      }

      return;
    }

    showSuccessMsg("HR Details Registered Successfully")

    setFormData({
      name: "",
      email: "",
      phone: ""
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
        <Box sx={{ mb: 1 }}>
          <p className='text-left text-[#1e293b] font-semibold'><Link to={'/'}>← <span className='underline'>Login</span></Link></p>
        </Box>
        {
          successMsg && (
            <Typography
              align='center'
              color='success.main'
              variant='subtitle1'
              sx={{ mb: 2, fontWeight: "medium" }}
            >
              {successMsg}
            </Typography>
          )
        }

        <Typography
          variant='h4'
          align='center'
          sx={{ mb: { xs: 3, sm: 4 }, fontWeight: "bold", color: "#1e293b" }}
        >
          Hr Registration
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
              startAdornment: <PersonIcon sx={{ mr: 1, color: '#1e293b' }} />,
            }}
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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
              startAdornment: <PhoneIcon sx={{ mr: 1, color: '#1e293b' }} />,
            }}
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]*",
              inputMode: "numeric",
            }}
            sx={{ mb: 2 }}
          />

          <Button
            type='submit'
            variant='contained'
            size='large'
            fullWidth
            sx={{
              borderRadius: 8,
              bgcolor: "#1e293b",
              boxShadow: 3,
              fontWeight: "medium",
              ":hover": { bgcolor: "#192a45" },
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

export default Register
