import axios from "axios";
import type { CodeSubmissionDTO, CodeValidationResult } from "../../types";

export const validateCode = async (codeSubmissionObj: CodeSubmissionDTO): Promise<CodeValidationResult> => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
    
    const response = await axios.post(`${BACKEND_URL}api/questions/validate`, codeSubmissionObj);

    return response.data as CodeValidationResult;
}