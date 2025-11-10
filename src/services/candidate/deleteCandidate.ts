import axios from "axios";
import { decryptJWT } from "../../cryptoUtils";

type Response = {
    success: boolean;
    message: string;
}

export const deleteCandidate = async (encryptedJwt: string, candidateId: string): Promise<Response> => {

    const jwt = decryptJWT(encryptedJwt);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {

        await axios.delete(`${BACKEND_URL}api/hr/deleteCandidate`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                candidateId
            }
        })

        return {
            success: true,
            message: "Candidate Deleted Successfully"
        } as Response;
    }
    catch (error: any) {
        console.error("Failed to delete candidate: ", error);
        return {
            success: false,
            message: error?.response?.data?.message as string || 'Failed to delete candidate'
        } as Response;
    }
}

export const deleteCandidateHandler = async (encryptedJwt: string ,candidateId: string, setErrorMsg: React.Dispatch<React.SetStateAction<string>>, fetchCandidates: () => void) => {

    if (candidateId !== '') {
        const res = await deleteCandidate(encryptedJwt, candidateId);

        if (res.success) {
            fetchCandidates();
        }
        else {
            setErrorMsg(res.message);
            setTimeout(() => setErrorMsg(""), 2000);
        }
    }
}