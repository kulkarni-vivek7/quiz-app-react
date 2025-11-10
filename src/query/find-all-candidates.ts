import axios from "axios";
import type { Candidate } from "../types";
import { decryptJWT } from "../cryptoUtils";

type FetchCandidatesResponse = {
    listOfCandidates: Candidate[];
    totalCandidates: number;
}

type ResponseType = {
    success: boolean;
    message: string;
    result: Candidate;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

export const findAllCandidates = async (encryptedJwt: string, page: number, limit: number): Promise<FetchCandidatesResponse> => {
    
    const jwt = decryptJWT(encryptedJwt);

    try {
        
        const response = await axios.get(`${BACKEND_URL}api/hr/getCandidates`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                searchParam: 'candidates',
                searchValue: 'quiz_pending',
                page,
                limit
            }
        });

        const listOfCandidates: Candidate[] = response.data?.body?.content || [];
        const totalCandidates: number = response.data?.body?.totalElements || 0;

        return {
            listOfCandidates,
            totalCandidates
        }
    } 
    catch (error: any) {
        return {
            listOfCandidates: [],
            totalCandidates: 0,
        };
    }
}

export const findCandidateByToken = async (token: string): Promise<ResponseType> => {
    try {
        const response = await axios.get(`${BACKEND_URL}api/candidate/getCandidateByToken`, {
            params: {
                token
            }
        });

        const candidate: Candidate = response.data?.body || {};

        return {
            success: true,
            message: "Candidate fetched successfully",
            result: candidate
        }
    } 
    catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch candidate by token",
            result: {
                id: '',
                name: '',
                age: 0,
                email: '',
                phone: '',
                subject: [],
            }
        };
    }
}

export const searchCandidates = async (encryptedJwt: string, searchParam: string, searchValue: string, page: number, limit: number): Promise<FetchCandidatesResponse> => {
    const jwt = decryptJWT(encryptedJwt);

    try {
        const response = await axios.get(`${BACKEND_URL}api/hr/getCandidates`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                searchParam,
                searchValue,
                page,
                limit
            }
        });

        let listOfCandidates: Candidate[] = [];

        const totalCandidates: number = response.data?.body?.totalElements || 1;

        if (searchParam === 'id' || searchParam === 'email' || searchParam === 'phone') {
            
            listOfCandidates = Array.from([response.data?.body])
        }
        else
        {
            listOfCandidates = response.data?.body?.content || [];
        }

        return {
            listOfCandidates,
            totalCandidates
        }
    } 
    catch (error: any) {
        return {
            listOfCandidates: [],
            totalCandidates: 0,
        };
    }
}

export const findAllQuizCompletedCandidates = async (encryptedJwt: string, page: number, limit: number): Promise<FetchCandidatesResponse> => {

    const jwt = decryptJWT(encryptedJwt);
    

    try {

        const response = await axios.get(`${BACKEND_URL}api/hr/getCandidates`,
            {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                },
                params: {
                    searchParam: 'candidates',
                    searchValue: 'quiz_completed',
                    page,
                    limit
                }
            }
        );

        const listOfCandidates: Candidate[] = response.data?.body?.content || [];
        const totalCandidates: number = response.data?.body?.totalElements || 0;

        return {
            listOfCandidates,
            totalCandidates
        }
        
    } 
    catch (error: any) {
        return {
            listOfCandidates: [],
            totalCandidates: 0,
        };
    }
}