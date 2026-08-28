import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import authService from "../../services/authService";

/*
=====================================================
INITIAL STATE
=====================================================
*/

const storedToken = localStorage.getItem("connectmeet_token");

const storedUser = localStorage.getItem("connectmeet_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,

  token: storedToken || null,

  isAuthenticated: Boolean(storedToken),

  isLoading: false,

  error: null,
};

/*
=====================================================
REGISTER
=====================================================
*/

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

/*
=====================================================
LOGIN
=====================================================
*/

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed",
      );
    }
  },
);

/*
=====================================================
GET CURRENT USER
=====================================================
*/

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, thunkAPI) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to get current user",
      );
    }
  },
);

/*
=====================================================
SLICE
=====================================================
*/

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("connectmeet_token");

      localStorage.removeItem("connectmeet_user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /*
    REGISTER
    */

    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    /*
    LOGIN
    */

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const { token, user } = action.payload;

        state.token = token;
        state.user = user;
        state.isAuthenticated = true;

        localStorage.setItem("connectmeet_token", token);

        localStorage.setItem("connectmeet_user", JSON.stringify(user));
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    /*
    CURRENT USER
    */

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        localStorage.setItem(
          "connectmeet_user",
          JSON.stringify(action.payload.user),
        );
      })

      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        localStorage.removeItem("connectmeet_token");

        localStorage.removeItem("connectmeet_user");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
