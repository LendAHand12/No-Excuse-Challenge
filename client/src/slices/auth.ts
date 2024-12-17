import { createSlice } from '@reduxjs/toolkit';

const initialUserLocalStorage = localStorage.getItem('user');
const defaultInitialState = {};
if (initialUserLocalStorage) {
  const initialUser = JSON.parse(initialUserLocalStorage);
  if (initialUser.accessToken) {
    Object.assign(defaultInitialState, {
      accessToken: initialUser.accessToken,
      userInfo: initialUser.userInfo,
    });
  }
}
const auth = createSlice({
  name: 'auth',
  initialState: defaultInitialState,
  reducers: {
    LOGIN: (state, action) => {
      Object.assign(state, action.payload);
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    REFRESH_TOKEN: (state, action) => {
      let newAuth = JSON.parse(localStorage.getItem('user'));
      newAuth.accessToken = action.payload;
      localStorage.setItem('user', JSON.stringify(newAuth));
      Object.assign(state, { ...state, accessToken: action.payload });
    },
    UPDATE_USER_INFO: (state, action) => {
      let newAuth = JSON.parse(localStorage.getItem('user'));
      newAuth.userInfo = action.payload;
      localStorage.setItem('user', JSON.stringify(newAuth));
      Object.assign(state, { ...state, userInfo: action.payload });
    },
    LOGOUT: (state) => {
      Object.assign(state, {});
      localStorage.removeItem('user');
      return {};
    },
  },
});

const { reducer, actions } = auth;
export const { LOGIN, LOGOUT, UPDATE_USER_INFO } = actions;
export default reducer;
