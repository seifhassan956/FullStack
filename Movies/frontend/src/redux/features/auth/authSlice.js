import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,

    isAuthenticated: localStorage.getItem('userInfo') ? true : false
};

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    
    reducers: {
        setCredentials: (state, action) => {
            const user = action.payload;
            state.userInfo = user; 
            state.isAuthenticated = true; 
            localStorage.setItem('userInfo', JSON.stringify(user));
        
            const expirationTime = new Date().getTime() + 60 * 60 * 1000; 
            localStorage.setItem('expirationTime', expirationTime);
        },

        logout: (state) => {
            state.userInfo = null;
            localStorage.clear();
        },
    },
});

export const { setCredentials, logout } = AuthSlice.actions;
export default AuthSlice.reducer;