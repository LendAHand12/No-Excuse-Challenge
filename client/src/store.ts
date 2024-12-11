import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

const rootReducer = {
  auth: authReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
