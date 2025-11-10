import axios from "axios";
import { decryptJWT } from "../cryptoUtils";
import type { QuizInvite } from "../types";

type FindQuizInviteByCandidateIdResponse = {
    quizInvite: QuizInvite;   
}

export const findTokenByCandidateId = async (encryptedJwt: string, candidateId: string): Promise<FindQuizInviteByCandidateIdResponse> => {
    const jwt = decryptJWT(encryptedJwt);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
        const response = await axios.get(`${BACKEND_URL}api/hr/getQuizInviteByCandidateId`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                candidateId
            }
        })

        return { quizInvite: response.data.body as QuizInvite }
    } 
    catch (error) {
        console.error("Failed to fetch token by candidate id: ", error);
        return {
            quizInvite: {
                id: '',
                token: '',
                quizTimeLimit: '',
                candidateId: '',
                subject: [],
                used: false,
            }
        }
    }
}