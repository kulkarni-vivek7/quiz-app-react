import axios from "axios";
import { z } from 'zod';
import type { Candidate } from "../../types";
import { decryptJWT } from "../../cryptoUtils";

const subjectsEnum = z.enum(["APTITUDE", "JAVA", "ADVANCEJAVA", "PYTHON", "DBMS", "DSA", "COMPUTERS", "NETWROKING", "WEBDEVELOPMENT", "REACTJS", "TYPESCRIPT", "NEXTJS"]);

export type CandidateSubject = z.infer<typeof subjectsEnum>;
export const candidateSubjects: CandidateSubject[] = subjectsEnum.options;

const addCandidateSchema = z.object({
    name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters long"),
    age: z.number().nonnegative("Age is required").min(18, "Age must be at least 18"),
    email: z.email().nonempty("Email is required"),
    phone: z.string().nonempty("Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
    subject: z.array(subjectsEnum).min(1, "Select at least one subject"),
})

export type CandidateInput = z.infer<typeof addCandidateSchema>;

export type AddCandidateFormState = {
    errors: {
        [key: string]: string[]
    };
    success: boolean;
    result?: Candidate;
    timeStamp: number;
}

export const addCandidate = async (data: CandidateInput, encryptedJwt: string): Promise<AddCandidateFormState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

    const jwt = decryptJWT(encryptedJwt);

    const result = addCandidateSchema.safeParse(data);

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            success: false,
            timeStamp: Date.now(),
        }
    }

    try {

        const res = await axios.post(`${BACKEND_URL}api/hr/enrollCandidate`, data, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })

        if (res.status === 201) {
            return {
                errors: {},
                success: true,
                timeStamp: Date.now(),
                result: res.data.body as Candidate
            }
        }
        else
        {
            return {
                errors: { formErrors: [res.data.message || "Unexpected server response"] },
                success: false,
                timeStamp: Date.now(),
            }
        }
        
    } catch (error: any) {
        return {
            errors: { formErrors: [error?.response?.data?.message || "Unable to Register Candidate"] },
            success: false,
            timeStamp: Date.now(),
        }
    }
}