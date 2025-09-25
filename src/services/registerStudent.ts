import axios from "axios";
import { z } from "zod"

export const studentSchema = z.object({
    name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters long"),
    age: z.number().int().min(1, "Age must be positive"),
    email: z.email().nonempty("Email is required"),
    phone: z.string().nonempty("Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
    subject: z.string().nonempty("Subject is required"),
})

type QuestionType = {
    questionId: string;
    questionText: string;
    options: string[];
    subject: string;
}

export type StudentInput = z.infer<typeof studentSchema>

export type RegisterFormState = {
    errors: { 
        [key: string]: string[]
    };
    success: boolean;
    timestamp: number;
    result?: QuestionType[];
}

export const enrollStudent = async (data: StudentInput): 
Promise<RegisterFormState> => {

    const result = studentSchema.safeParse(data);

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            success: false,
            timestamp: Date.now(),
        }
    }

    try {

        const res = await axios.post("http://localhost:8081/api/student/enroll", data)

        if (res.status === 200) {
            return {
                errors: {},
                success: true,
                timestamp: Date.now(),
                result: res.data,
            }
        }
        else
        {
            return {
                errors: { formErrors: [res.data.message || "Unexpected server response"]},
                success: false,
                timestamp: Date.now(),
            }
        }
        
    } catch (error: any) {
        return {
            errors: { formErrors: [error?.response?.data?.message || "Registration failed!"]},
            success: false,
            timestamp: Date.now(),
        }
    }
}