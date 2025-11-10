import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const getSecretKey = () => {
    if (!SECRET_KEY) {
        console.warn('VITE_SECRET_KEY is not defined. Encryption will use an empty key.');
    }

    return SECRET_KEY ?? '';
}

export const encryptJWT = (jwt: string): string => {

    const ciphertext = CryptoJS.AES.encrypt(jwt, getSecretKey()).toString();

    return ciphertext;
}

export const decryptJWT = (ciphertext: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    catch (error) {
        console.error("Decryption Failed", error);
        return "";
    }
}

export const encryptData = <T>(payload: T): string => {
    const plaintext = JSON.stringify(payload);
    return CryptoJS.AES.encrypt(plaintext, getSecretKey()).toString();
}

export const decryptData = <T>(ciphertext: string): T | null => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
        const decoded = bytes.toString(CryptoJS.enc.Utf8);

        if (!decoded) {
            return null;
        }

        return JSON.parse(decoded) as T;
    }
    catch (error) {
        console.error('Failed to decrypt payload', error);
        return null;
    }
}