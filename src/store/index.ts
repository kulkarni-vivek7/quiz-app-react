import sessionStorage from 'redux-persist/lib/storage/session';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import authReducer from './authSlice';
import quizReducer from './quizSlice';

const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: string) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        }
    }
}

const storage = typeof window !== 'undefined'
    ? sessionStorage
    : createNoopStorage();

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ["name", "email", "jwt"],
};

const quizPersistConfig = {
    key: 'quiz',
    storage,
    whitelist: ["entries"],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    quiz: persistReducer(quizPersistConfig, quizReducer),
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        })
})

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;