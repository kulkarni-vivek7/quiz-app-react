import axios from "axios";
import { z } from "zod";
import { decryptJWT } from "../../cryptoUtils";

const SUBJECT_VALUES = [
  "APTITUDE",
  "JAVA",
  "ADVANCEJAVA",
  "PYTHON",
  "DBMS",
  "DSA",
  "COMPUTERS",
  "NETWORKING",
  "WEBDEVELOPMENT",
  "REACTJS",
  "TYPESCRIPT",
  "NEXTJS",
] as const;

const subjectSchema = z.enum(SUBJECT_VALUES);

const testCaseSchema = z.object({
  input: z.string().trim().min(1, "Test case input is required"),
  expectedOutput: z.string().trim().min(1, "Expected output is required"),
  isSample: z.boolean().optional(),
});

const baseQuestionSchema = z.object({
  questionText: z.string().trim().min(1, "Question text is required"),
  subject: subjectSchema,
});

const mcqQuestionSchema = baseQuestionSchema
  .extend({
    questionType: z.literal("MCQ"),
    options: z
      .array(z.string().trim().min(1, "Option cannot be empty"))
      .min(2, "At least 2 options are required"),
    correctOptionIndex: z.number().int().nonnegative("Correct option index cannot be negative"),
  })
  .refine(
    (data) => data.correctOptionIndex < data.options.length,
    {
      path: ["correctOptionIndex"],
      message: "Correct option index must point to one of the options",
    },
  );

const codingQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal("CODING"),
  starterCode: z.string().trim().min(1, "Starter code is required"),
  testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
  language: z.string().trim().min(1, "Language is required"),
});

const addQuestionSchema = z.discriminatedUnion("questionType", [mcqQuestionSchema, codingQuestionSchema]);

const addQuestionsSchema = z
  .array(addQuestionSchema)
  .min(1, "At least one question is required");

export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type AddQuestionsInput = z.infer<typeof addQuestionsSchema>;

export type AddQuestionResult = {
  success: boolean;
  message?: string;
  errors: Record<string, string[]>;
  timestamp: number;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

const formatValidationErrors = (issues: z.ZodIssue[]): Record<string, string[]> => {
  return issues.reduce<Record<string, string[]>>((accumulator, issue) => {
    const path = issue.path.join(".") || "formErrors";
    accumulator[path] = accumulator[path] ?? [];
    accumulator[path].push(issue.message);
    return accumulator;
  }, {});
};

const normalizeQuestionPayload = (question: AddQuestionInput) => {
  if (question.questionType === "MCQ") {
    return {
      questionText: question.questionText,
      questionType: question.questionType,
      subject: question.subject,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
    };
  }

  return {
    questionText: question.questionText,
    questionType: question.questionType,
    subject: question.subject,
    starterCode: question.starterCode,
    testCases: question.testCases.map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample ?? false,
    })),
    language: question.language.trim().toLowerCase(),
  };
};

const resolveServerMessage = (data: unknown): string | undefined => {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && "message" in data) {
    const { message } = data as { message?: unknown };
    if (typeof message === "string") {
      return message;
    }
  }

  return undefined;
};

export const addQuestions = async (
  questions: AddQuestionInput | AddQuestionInput[],
  encryptedJwt?: string,
): Promise<AddQuestionResult> => {
  const candidateQuestions = Array.isArray(questions) ? questions : [questions];
  const validationResult = addQuestionsSchema.safeParse(candidateQuestions);

  if (!validationResult.success) {
    return {
      success: false,
      errors: formatValidationErrors(validationResult.error.issues),
      timestamp: Date.now(),
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (encryptedJwt) {
    const jwt = decryptJWT(encryptedJwt);
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
  }

  try {
    const payload = validationResult.data.map(normalizeQuestionPayload);
    const response = await axios.post(`${BACKEND_URL}api/questions`, payload, { headers });

    const message = resolveServerMessage(response.data) ?? "Questions added successfully";

    return {
      success: true,
      message,
      errors: {},
      timestamp: Date.now(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        resolveServerMessage(error.response?.data) ?? error.response?.statusText ?? "Failed to add questions";

      return {
        success: false,
        message,
        errors: { formErrors: [message] },
        timestamp: Date.now(),
      };
    }

    const message = error instanceof Error ? error.message : "Unexpected error while adding questions";

    return {
      success: false,
      message,
      errors: { formErrors: [message] },
      timestamp: Date.now(),
    };
  }
};