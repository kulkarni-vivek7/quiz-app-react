import axios from "axios";
import { z } from "zod";
import type { UserDetails } from "../../types";

const registerHrSchema = z.object({
    name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters long"),
    email: z.email().nonempty("Email is required"),
    phone: z.string().nonempty("Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
})

export type HrInput = z.infer<typeof registerHrSchema>;

export type RegisterFormState = {
    errors: {
        [key: string]: string[]
    };
    success: boolean;
    timestamp: number;
    result?: UserDetails;
}

export const registerHr = async (data: HrInput): Promise<RegisterFormState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

    const result = registerHrSchema.safeParse(data);

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            success: false,
            timestamp: Date.now(),
        }
    }

    try {

        const res = await axios.post(`${BACKEND_URL}api/auth/register`, data);

        if (res.status === 201)
        {
            return {
                errors: {},
                success: true,
                timestamp: Date.now(),
                result: res.data?.body,
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