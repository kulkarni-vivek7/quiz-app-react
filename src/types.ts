export type QuestionWithoutAnswerType = {
    questionId: string;
    questionText: string;
    questionType: 'MCQ' | 'CODING',
    subject: string;
    options?: string[];
    starterCode?: string;
    sampleTestCases?: {
        input: string;
        expectedOutput: string;
        isSample: boolean;
    }[];
    language?: string;
}

export type UserDetails = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

export type Candidate = {
    id: string;
    name: string;
    age: number;
    email: string;
    phone: string;
    subject: string[];
}

export type EnrollmentResponse = {
    candidateId: string;
    subject: string[];
    inviteLink: string;
    quizTimeLimit: string; // in minutes
}

export type AnswerSet = {
    candidateId: string;
    answers: AnswerDTO[];
    timeTaken: string;
    totalQuestions?: number;
    correctAnswers?: number;
    isCompleted?: boolean;
};

export type AnswerDTO = {
    questionId: string;
    questionText?: string; // for referance
    questionType: 'MCQ' | 'CODING',
    // For MCQ questions
    options?: string[];
    correctOptionIndex?: number;
    chosenOptionIndex?: number;
    // For Coding questions
    candidateCode?: string;
    language?: string;
    passedTestCases?: number;
    totalTestCases?: number;
    testResults?: string[];

    correct?: boolean;
}

export type QuizInvite = {
    id: string;
    token: string;
    quizTimeLimit: string;
    candidateId: string;
    subject: string[];
    used: boolean;
}

export type QuestionType = {
    questionId: string;
    questionText: string;
    questionType: 'MCQ' | 'CODING',
    options?: string[];
    subject: string;
    chosenOptionIndex?: number;
    correctOptionIndex?: number;
    starterCode?: string;
    sampleTestCases?: {
        input: string;
        expectedOutput: string;
        isSample: boolean;
    }[];
    testCases?: {
        input: string;
        expectedOutput: string;
        isSample: boolean;
    }[];
    language?: string;
    candidateCode?: string;
}


export type PersistedQuizState = {
    candidateId: string;
    questions: QuestionType[];
    currentQuestion: number;
    submitted: boolean;
    quizTimeLimitLabel?: string | null;
    quizEndTime?: number | null;
}


export type AnswerSetResponse = {
    candidateName: string;
    subjectName: string[];
    answers: AnswerDTO[];
    timeTaken: string;
    totalQuestions?: number;
    correctAnswers?: number;
    isCompleted?: boolean;
    quizTimeLimit?: string;
}

export type CodeValidationResult = {
    message: string;
    passedTestCases: number;
    totalTestCases: number;
    errorDetails: string | null;
    testResults: string[];
    correct?: boolean;
    isCorrect?: boolean;
}

export type CodeSubmissionDTO = {
    questionId: string;
    candidateCode: string;
    language: string;
}