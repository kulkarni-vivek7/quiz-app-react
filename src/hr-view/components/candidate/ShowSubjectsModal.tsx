import { Box, Chip, Divider, IconButton, Modal, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

type ShowSubjectsModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    subjects: string[];
}

const ShowSubjectsModal: React.FC<ShowSubjectsModalProps> = ({ open, setOpen, subjects }) => {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          width: { xs: '90%', sm: 420, md: 500 },
          maxHeight: '80vh',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: 24,
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Subjects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore the candidate&apos;s proficiency areas.
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ mt: -1, mr: -1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'divider', my: -1 }} />

        {subjects.length ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              overflowY: 'auto',
              pr: 1,
            }}
          >
            {subjects.map((subject) => (
              <Chip
                key={subject}
                label={subject === 'APTITUDE' ? 'Aptitude' : subject === 'JAVA' ? 'Java' : subject === 'ADVANCEJAVA' ? 'Advance Java' : subject === 'PYTHON' ? 'Python' : subject === 'DBMS' ? 'DBMS' : subject === 'DSA' ? 'DSA' : subject === 'COMPUTERS' ? 'Computers' : subject === 'NETWROKING' ? 'Networking' : subject === 'WEBDEVELOPMENT' ? 'Web Development' : subject === 'REACTJS' ? 'ReactJS' : subject === 'TYPESCRIPT' ? 'TypeScript' : subject === 'NEXTJS' ? 'NextJS' : 'Unknown'}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{
                  fontWeight: 500,
                  letterSpacing: 0.25,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No subjects available for this candidate yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default ShowSubjectsModal
