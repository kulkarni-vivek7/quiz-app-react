import { z } from "zod";
import type { EnrollmentResponse } from "../../types";
import { decryptJWT } from "../../cryptoUtils";
import axios from "axios";

const addQuizTimeLimitSchema = z.string("Time limit is required");

export type QuizTimeLimitInput = z.infer<typeof addQuizTimeLimitSchema>;

export type AddQuizTimeLimitFormState = {
    errors: {
        [key: string]: string[]
    };
    value?: EnrollmentResponse;
    success: boolean;
    timestamp: number;
}

export const addQuizTimeLimit = async (encryptedJwt: string, timeLimitInMinutes: string, candidateId: string): Promise<AddQuizTimeLimitFormState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

    const jwt = decryptJWT(encryptedJwt);

    const result = addQuizTimeLimitSchema.safeParse(timeLimitInMinutes);

    if (!result.success) {
        return {
            errors: {
                timeLimitInMinutes: [result.error.flatten().fieldErrors],
            },
            success: false,
            timestamp: Date.now(),
        }
    }

    try {
        
        const res = await axios.put(`${BACKEND_URL}api/hr/updateQuizTimeLimit`, undefined, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
            },
            params: {
                candidateId,
                timeLimitInMinutes
            }
        })

        if (res.status === 200) {
            return {
                errors: {},
                success: true,
                timestamp: Date.now(),
                value: res.data
            }
        }
        else
        {
            return {
                errors: { formErrors: [res.data.message || "Unexpected Server response"] },
                success: false,
                timestamp: Date.now(),
            }
        }
    } 
    catch (error: any) {
        return {
            errors: { formErrors: [error?.response?.data?.message || "Unable to Add Quiz Time Limit"] },
            success: false,
            timestamp: Date.now(),
        }
    }
}