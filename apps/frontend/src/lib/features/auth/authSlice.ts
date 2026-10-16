import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { User, LoginCredentials, RegisterData, TokenResponse, ApiResponse } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Safely read token from localStorage in browser environment
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AuthState = {
  user: null,
  token: initialToken,
  loading: false,
  error: null,
  isAuthenticated: !!initialToken,
};

export const loginUser = createAsyncThunk<TokenResponse, LoginCredentials, { rejectValue: string }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<TokenResponse>>('/api/auth/login', credentials);
      const tokenData = response.data.data;
      if (typeof window !== 'undefined' && tokenData?.access_token) {
        localStorage.setItem('token', tokenData.access_token);
      }
      return tokenData;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.detail || 'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk<TokenResponse, RegisterData, { rejectValue: string }>(
  'auth/registerUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<TokenResponse>>('/api/auth/register', data);
      const tokenData = response.data.data;
      if (typeof window !== 'undefined' && tokenData?.access_token) {
        localStorage.setItem('token', tokenData.access_token);
      }
      return tokenData;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please check your details.';
      return rejectWithValue(message);
    }
  }
);

export const getProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<User>>('/api/auth/me');
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch user profile';
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk<User, Partial<User>, { rejectValue: string }>(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>('/api/auth/me', data);
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.detail || 'Failed to update user profile';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;

