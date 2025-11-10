import axios from "axios";
import { z } from "zod";

const hrLoginSchema = z.object({
    email: z.email().nonempty("Email is required"),
    otp: z.string().nonempty("OTP is required").length(6, "OTP must be 6 digits"),
})

export type HrLoginInput = z.infer<typeof hrLoginSchema>;

export type LoginFormState = {
    errors: {
        [key: string]: string[]
    },
    success: boolean;
    timestamp: number;
    result?: string;
}

export const login = async (data: HrLoginInput): Promise<LoginFormState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string

    const result = hrLoginSchema.safeParse(data);

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            success: false,
            timestamp: Date.now(),
        }
    }

    try {

        const res = await axios.post(`${BACKEND_URL}api/auth/login`, data);

        if (res.status === 200)
        {
            return {
                errors: {},
                success: true,
                timestamp: Date.now(),
                result: res.data?.body
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
        
    } 
    catch (error: any) {
        return {
            errors: { formErrors: [error?.response?.data?.message || "Registration failed!"] },
            success: false,
            timestamp: Date.now(),
        }
    }
}