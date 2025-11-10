import axios from "axios";
import { z } from "zod";

const sendOtpSchema = z.email().nonempty("Email is required");

export type EmailInput = z.infer<typeof sendOtpSchema>;

export type SendOtpFormState = {
    errors: {
        [key: string]: string[]
    };
    success: boolean;
    timestamp: number;
}

export const sendOtp = async (email: EmailInput): Promise<SendOtpFormState> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

    const result = sendOtpSchema.safeParse(email);

    if (!result.success) {
        return {
            errors: {
                email: [result.error.flatten().fieldErrors],
            },
            success: false,
            timestamp: Date.now(),
        }
    }

    try {

        const res = await axios.get(`${BACKEND_URL}api/auth/send-otp-email`, {
            params: {
                email: email,
            }
        })

        if (res.status === 200)
        {
            return {
                errors: {},
                success: true,
                timestamp: Date.now()
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
            errors: { formErrors: [error?.response?.data?.message || "Failed to send OTP. Please try again."] },
            success: false,
            timestamp: Date.now(),
        }
    }
}