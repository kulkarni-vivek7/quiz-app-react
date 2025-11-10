import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PersistedQuizState } from '../types';
import { encryptData } from '../cryptoUtils';

export type QuizState = {
    entries: Record<string, string>;
};

const initialState: QuizState = {
    entries: {},
};

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        saveQuizState(state, action: PayloadAction<{ token: string; state: PersistedQuizState }>) {
            const { token, state: quizState } = action.payload;
            state.entries[token] = encryptData(quizState);
        },
        setEncryptedQuizState(state, action: PayloadAction<{ token: string; encrypted: string }>) {
            const { token, encrypted } = action.payload;
            state.entries[token] = encrypted;
        },
        clearQuizState(state, action: PayloadAction<string>) {
            delete state.entries[action.payload];
        },
    },
});

export const { saveQuizState, setEncryptedQuizState, clearQuizState } = quizSlice.actions;

export default quizSlice.reducer;
