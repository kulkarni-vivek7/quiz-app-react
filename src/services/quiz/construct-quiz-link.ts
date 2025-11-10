import { findTokenByCandidateId } from "../../query/find-token-by-candidate-id"
import type { EnrollmentResponse, QuizInvite } from "../../types"

export const constructQuizLinkResponse = async (encryptedJwt: string, candidateId: string, subject: string[], setQuizInvite: React.Dispatch<React.SetStateAction<QuizInvite>>, setEnrollmentResponse: React.Dispatch<React.SetStateAction<EnrollmentResponse>>, setQuizLinkDisplayModalOpen: React.Dispatch<React.SetStateAction<boolean>>,) => {
    try {
      const res = await findTokenByCandidateId(encryptedJwt, candidateId)
      setQuizInvite(res.quizInvite)

      const quizLink = `http://localhost:5173/quiz?token=${res.quizInvite.token}`

      setEnrollmentResponse({
        candidateId: candidateId,
        subject: subject,
        inviteLink: quizLink,
        quizTimeLimit: res.quizInvite.quizTimeLimit
      })

      setQuizLinkDisplayModalOpen(true)
    }
    catch (error) {
      console.error("Failed to fetch token by candidate id: ", error);
    }
  }