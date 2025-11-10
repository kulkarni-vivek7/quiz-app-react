import axios from "axios";
import type { AnswerSet, QuestionType } from "../types";

export type AnswerSetState = {
    values: {
        candidateId: string;
        questions: QuestionType[]
    },
    success: boolean;
    timestamp: number;
}

export const submitAnswerSets = async (token: string ,answerSet: AnswerSet): Promise<AnswerSetState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const response = await axios.post(`${BACKEND_URL}api/candidate/answer`,
        answerSet, {
            params: {
                token
            }
        }
    )

    return {
        values: response.data.body,
        success: true,
        timestamp: Date.now(),
    }
}