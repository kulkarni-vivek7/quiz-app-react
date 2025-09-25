import axios from "axios";
import type { QuestionType } from "../components/QuizApp";

export type AnswerSetState = {
    values: {
        studentId: string;
        questions: QuestionType[]
    },
    success: boolean;
    timestamp: number;
}

export type AnswerSet = {
    studentId: string;
    questions: QuestionType[]
}

export const submitAnswerSets = async (answerSet: AnswerSet): Promise<AnswerSetState> => {

    const response = await axios.post("http://localhost:8081/api/student/answer",
        answerSet
    )

    return {
        values: response.data.body,
        success: true,
        timestamp: Date.now(),
    }
}