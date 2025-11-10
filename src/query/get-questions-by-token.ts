import axios from "axios";
import type { QuestionWithoutAnswerType } from "../types";


type ResponseType = {
    success: boolean;
    message: string;
    result: {
        candidateId: string;
        subject: string;
        quizTimeLimit?: string;
        questions: QuestionWithoutAnswerType[];
    }
}

export const getQuestionsByToken = async (token: string): Promise<ResponseType> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {

        const responce = await axios.get(`${BACKEND_URL}api/quiz/start`, {
            params: {
                token
            }
        });
        return {
            success: true,
            message: "Questions fetched successfully",
            result: responce.data
        } as ResponseType;

    } catch (error: any) {
        console.error("Failed to fetch questions by token: ", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch questions by token",
            result: {
                candidateId: '',
                subject: '',
                questions: [],
            }
        }
    }
}