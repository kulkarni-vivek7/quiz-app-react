import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'

const QuizComplete = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        px: 2,
        py: { xs: 2, sm: 0 }
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.95)',
          boxShadow: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            right: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            zIndex: 0
          }}
        />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Success Icon */}
          <CheckCircleIcon
            color="success"
            sx={{
              fontSize: { xs: 60, sm: 80 },
              mb: { xs: 2, sm: 3 },
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />

          {/* Main Title */}
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 'bold',
              color: '#1e293b',
              mb: { xs: 2, sm: 3 },
              lineHeight: 1.2
            }}
          >
            You Have Submitted The Quiz
          </Typography>

          {/* Thank you message with icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 2, sm: 3 },
              gap: 1
            }}
          >
            <ThumbUpIcon
              color="primary"
              sx={{
                fontSize: { xs: 24, sm: 28 },
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                fontWeight: 'medium',
                color: '#4b5563',
                lineHeight: 1.3
              }}
            >
              Thank You For Taking The Quiz
            </Typography>
          </Box>

          {/* Additional encouraging message */}
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: 400,
              mx: 'auto',
              lineHeight: 1.5
            }}
          >
            Your responses have been recorded successfully. <br />
            You can close this window now.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default QuizComplete
