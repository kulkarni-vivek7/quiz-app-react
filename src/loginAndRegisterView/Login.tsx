import React, { useEffect, useRef, useState } from 'react'
import { sendOtp, type EmailInput } from '../services/loginAndRegister/send-otp'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setEmailSlice, setJwtSlice } from '../store/authSlice'
import { Box, Button, Divider, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import EmailIcon from "@mui/icons-material/Email";
import { MuiOtpInput } from 'mui-one-time-password-input'
import { login, type HrLoginInput } from '../services/loginAndRegister/login'

const Login = () => {

  const [email, setEmail] = useState<EmailInput>("")
  const [otp, setOtp] = useState<string>("")
  const [sendOtpFieldErrors, setSendOtpFieldErrors] = useState<{ [key: string]: string[] }>({})
  const [sendOtpFormErrorMsg, setSendOtpFormErrorMsg] = useState<string>("")
  const [sendOtpSuccessMsg, setSendOtpSuccessMsg] = useState<string>("")
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string>("")
  const [loginFieldErrors, setLoginFieldErrors] = useState<{ [key: string]: string[] }>({})
  const [loginFormErrorMsg, setLoginFormErrorMsg] = useState<string>("")
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false)
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)

  const timers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({})

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const showSendOtpFieldError = (message: string) => {

    setSendOtpFieldErrors({
      email: [message]
    })
    const timer = setTimeout(() => setSendOtpFieldErrors({}), 2000)

    return () => clearTimeout(timer)
  }

  const showSendOtpFormError = (msg: string) => {
    setSendOtpFormErrorMsg(msg);
    const timer = setTimeout(() => setSendOtpFormErrorMsg(""), 2000)

    return () => clearTimeout(timer)
  }

  const showSendOtpSuccessMsg = (msg: string) => {
    setSendOtpSuccessMsg(msg);

    const timer = setTimeout(() => setSendOtpSuccessMsg(""), 2000)

    return () => clearTimeout(timer)
  }

  const showLoginFormError = (message: string) => {

    setLoginFormErrorMsg(message);
    const timer = setTimeout(() => setLoginFormErrorMsg(""), 2000)

    return () => clearTimeout(timer)
  }

  const showLoginFieldError = (field: string, messages: string[]) => {
    setLoginFieldErrors(prev => ({ ...prev, [field]: messages }))
    if (timers.current[field]) clearTimeout(timers.current[field])
    timers.current[field] = setTimeout(() => {
      setLoginFieldErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy;
      })
    }, 2000)
  }

  const showLoginSuccessMsg = (msg: string) => {
    setLoginSuccessMsg(msg);

    const timer = setTimeout(() => {
      setLoginSuccessMsg("")
      navigate("/hr");
    }, 1000)

    return () => clearTimeout(timer)
  }


  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          window.clearInterval(intervalId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [cooldownSeconds])



  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cooldownSeconds > 0) {
      return;
    }

    setSendOtpFieldErrors({})
    setSendOtpFormErrorMsg("")
    setSendOtpSuccessMsg("")

    setIsSendingOtp(true)

    const response = await sendOtp(email);

    if (response.errors.formErrors?.length) {
      showSendOtpFormError(response.errors.formErrors[0])
      setIsSendingOtp(false)
    }
    if (!response.success) {

      if (response.errors.email?.length) {
        showSendOtpFieldError(response.errors.email[0])
      }
      setIsSendingOtp(false)
      return;
    }

    dispatch(setEmailSlice(email));

    showSendOtpSuccessMsg("Otp Sent Successfully")

    setIsSendingOtp(false)
    setIsOtpSent(true)
    setCooldownSeconds(30)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoginFieldErrors({})
    setLoginFormErrorMsg("")
    setLoginSuccessMsg("")

    const loginData: HrLoginInput = {
      email,
      otp
    }

    const response = await login(loginData)

    if (!response.success) {

      Object.entries(response.errors).forEach(([field, messages]) => {
        if (field !== 'formErrors' && messages?.length) {
          showLoginFieldError(field, messages)

          switch (field) {
            case "email":
              setEmail("")
              break;
            case "otp":
              setOtp("")
              break;
            default:
              break;
          }
        }
      });

      if (response.errors.formErrors?.length) {
        showLoginFormError(response.errors.formErrors[0])
      }

      return;
    }

    dispatch(setJwtSlice(response.result || ""))

    showLoginSuccessMsg("Hr Logged In Successfully")

    setEmail("")
    setOtp("")
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
          isSendingOtp && (
            <Typography
              align='center'
              color='primary.main'
              variant='subtitle2'
              sx={{ mb: 2, fontWeight: "medium" }}
            >
              Sending OTP...
            </Typography>
          )
        }

        {
          sendOtpSuccessMsg && (
            <Typography
              align='center'
              color='success.main'
              variant='subtitle1'
              sx={{ mb: 2, fontWeight: "medium" }}
            >
              {sendOtpSuccessMsg}
            </Typography>
          )
        }

        {
          loginSuccessMsg && (
            <Typography
              align='center'
              color='success.main'
              variant='subtitle1'
              sx={{ mb: 2, fontWeight: "medium" }}
            >
              {loginSuccessMsg}
            </Typography>
          )
        }

        <Typography
          variant='h4'
          align='center'
          sx={{ mb: { xs: 3, sm: 4 }, fontWeight: "bold", color: "#1e293b" }}
        >
          Login
        </Typography>

        <form onSubmit={handleSendOtp}>

          <TextField
            label="Email"
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant='outlined'
            fullWidth
            required
            error={!!sendOtpFieldErrors.email || !!loginFieldErrors.email}
            helperText={sendOtpFieldErrors.email ? sendOtpFieldErrors.email[0] : loginFieldErrors.email ? loginFieldErrors.email[0] : ""}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: '#1e293b' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ ml: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "#1e293b",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#334155" },
                      }}

                      type="submit"
                      disabled={email.length === 0 || isSendingOtp || cooldownSeconds > 0}
                    >
                      Send OTP
                    </Button>
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {
            cooldownSeconds > 0 && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', textAlign: 'right', mb: 1, mt: -1 }}
              >
                Resend in : {cooldownSeconds} s
              </Typography>
            )
          }
        </form>


        <form onSubmit={handleLogin}>
          {
            isOtpSent && (
              <MuiOtpInput
                value={otp}
                onChange={(value: string) => setOtp(value)}
                length={6}
                autoFocus
                sx={{ mb: 1 }}
              />
            )
          }
          <Typography
            variant='caption'
            color='error'
            sx={{ display: 'block', textAlign: 'left', mb: 2, fontWeight: 'bold' }}
          >
            {
              loginFieldErrors.otp ? loginFieldErrors.otp[0] : ""
            }
          </Typography>


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
            disabled={otp.length !== 6}
          >
            Login
          </Button>

          {
            sendOtpFormErrorMsg && (
              <Typography
                variant='caption'
                color='error'
                sx={{ mt: 2, display: 'block', textAlign: 'left' }}
              >
                {sendOtpFormErrorMsg}
              </Typography>
            )
          }

          {
            loginFormErrorMsg && (
              <Typography
                variant='caption'
                color='error'
                sx={{ mt: 2, display: 'block', textAlign: 'left' }}
              >
                {loginFormErrorMsg}
              </Typography>
            )
          }
        </form>

        <Divider sx={{ my: 2 }} />

        <Typography variant='body2' sx={{ textAlign: 'center' }}>
          Don't have an account? <Link to='/register' style={{ color: '#1e293b', textDecoration: 'underline', fontWeight: 'bold' }}>Register Here</Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Login
