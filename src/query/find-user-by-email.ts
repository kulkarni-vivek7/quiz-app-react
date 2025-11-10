import axios from "axios";
import type { UserDetails } from "../types";
import { decryptJWT } from "../cryptoUtils";

export const findUserByEmail = async (email: string, encryptedJwt: string): Promise<UserDetails> => {

    const jwt = decryptJWT(encryptedJwt);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;


    const response = await axios.get(`${BACKEND_URL}api/hr/byEmail`, {
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        params: {
            email: email
        }
    });

    return response.data?.body as UserDetails;
}