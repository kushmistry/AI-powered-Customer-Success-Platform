import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { User, ApiResponse } from '@/types';

export interface UserFilters {
  page?: number;
  size?: number;
}

export interface UserState {
  list: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  filters: UserFilters;
}

const initialState: UserState = {
  list: [],
  total: 0,
  page: 1,
  size: 10,
  pages: 1,
  loading: false,
  actionLoading: false,
  error: null,
  filters: {
    page: 1,
    size: 10,
  },
};

export const fetchUsers = createAsyncThunk<
  { items: User[]; total: number; page: number; size: number; pages: number },
  UserFilters | undefined,
  { rejectValue: string }
>('users/fetchUsers', async (filters, { rejectWithValue }) => {
  try {
    const page = filters?.page || 1;
    const size = filters?.size || 10;
    const response = await api.get<ApiResponse<User[]>>('/api/users', {
      params: { page, size },
    });
    return {
      items: response.data.data || [],
      total: response.data.meta?.total || 0,
      page: response.data.meta?.page || 1,
      size: response.data.meta?.size || 10,
      pages: response.data.meta?.pages || 1,
    };
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch team users';
    return rejectWithValue(message);
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; data: Partial<User> },
  { rejectValue: string }
>('users/updateUser', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, data);
    return response.data.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.response?.data?.detail || 'Failed to update user';
    return rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete<ApiResponse<null>>(`/api/users/${userId}`);
      return userId;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.detail || 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.pages = action.payload.pages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load users';
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update user';
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter((u) => u.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { setUserFilters, clearUserError } = userSlice.actions;
export default userSlice.reducer;

