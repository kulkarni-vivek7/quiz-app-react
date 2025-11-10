import { encryptJWT } from "../cryptoUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
    email: string;
    jwt: string;
}

const initialState: AuthState = {
    email: '',
    jwt: ''
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
        clearAuthSlice(state) {
            state.email = '',
            state.jwt = ''
        }
    }
})

export const { setEmailSlice, setJwtSlice, clearAuthSlice } = authSlice.actions;
export default authSlice.reducer;