import axios from "axios";
import { decryptJWT } from "../cryptoUtils";
import type { AnswerSet } from "../types";
import { findTokenByCandidateId } from "./find-token-by-candidate-id";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

export const findAnswerSetsByCandidateId = async (encryptedJwt: string, candidateId: string): Promise<AnswerSet & { quizTimeLimit?: string }> => {
    const jwt = decryptJWT(encryptedJwt);

    try {
        const [response, quizInviteResponse] = await Promise.all([
            axios.get(`${BACKEND_URL}api/hr/getAnswerSets`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                },
                params: {
                    searchParam: 'candidateId',
                    searchValue: candidateId,
                    page: 0,
                    limit: 5
                }
            }),
            findTokenByCandidateId(encryptedJwt, candidateId)
        ]);

        return {
            ...(response.data?.body as AnswerSet),
            quizTimeLimit: quizInviteResponse.quizInvite.quizTimeLimit
        };
        
    } 
    catch (error) {
        console.error('Failed to fetch answer sets:', error);
        return {
            candidateId: '',
            answers: [],
            timeTaken: '',
            totalQuestions: 0,
            correctAnswers: 0,
            isCompleted: false
        }
    }
}