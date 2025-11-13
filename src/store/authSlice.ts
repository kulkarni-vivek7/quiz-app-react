import { encryptJWT } from "../cryptoUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
    email: string;
    jwt: string;
    showExpiryNotification: boolean;
}

const initialState: AuthState = {
    email: '',
    jwt: '',
    showExpiryNotification: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setEmailSlice(state, action: PayloadAction<string>) {
            state.email = action.payload;
        },
        setJwtSlice(state, action: PayloadAction<string>) {
            state.jwt = encryptJWT(action.payload);
        },
        showTokenExpiryNotification(state) {
            state.showExpiryNotification = true;
        },
        clearAuthSlice(state) {
            state.email = '';
            state.jwt = '';
            state.showExpiryNotification = false;
        }
    }
})

export const { setEmailSlice, setJwtSlice, clearAuthSlice, showTokenExpiryNotification } = authSlice.actions;
export default authSlice.reducer;