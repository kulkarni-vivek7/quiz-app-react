import axios from "axios";
import { decryptJWT } from "../cryptoUtils";
import type { QuestionType } from "../types"

type FetchQuestionsResponse = {
    listOfQuestions: QuestionType[];
    totalQuestions: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

export const findAllQuestions = async (encryptedJwt:string, page: number, limit: number): Promise<FetchQuestionsResponse> => {

    const jwt = decryptJWT(encryptedJwt);

    try {
        const response = await axios.get(`${BACKEND_URL}api/hr/getAllQuestions`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                searchParam: "questions",
                searchValue: 'all',
                page,
                limit
            }
        })

        const listOfQuestions: QuestionType[] = response.data?.body?.content || [];
        const totalQuestions: number = response.data?.body?.totalElements || 0;

        return {
            listOfQuestions,
            totalQuestions
        }
    } 
    catch (error: any) {
        return {
            listOfQuestions: [],
            totalQuestions: 0,
        }
    }
}

export const searchQuestions = async (encryptedJwt: string, searchParam: string, searchValue: string, page: number, limit: number): Promise<FetchQuestionsResponse> => {

    const jwt = decryptJWT(encryptedJwt);

    try {
        
        const response = await axios.get(`${BACKEND_URL}api/hr/getAllQuestions`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                searchParam,
                searchValue,
                page,
                limit
            }
        })

        let listOfQuestions: QuestionType[] = []

        const totalQuestions: number = response.data?.body?.totalElements || 1;

        if (searchParam === 'questionId') {
            listOfQuestions = Array.from([response.data?.body])
        }
        else
        {
            listOfQuestions = response.data?.body?.content || [];
        }

        return {
            listOfQuestions,
            totalQuestions
        }
        
    } catch (error) {
        return {
            listOfQuestions: [],
            totalQuestions: 0,
        }
    }

}