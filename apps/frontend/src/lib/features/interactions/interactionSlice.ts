import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { ApiResponse, Interaction, InteractionFilters, PaginatedResponse } from '@/types';

export interface InteractionState {
  list: Interaction[];
  detail: Interaction | null;
  total: number;
  page: number;
  size: number;
  pages: number;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  filters: InteractionFilters;
}

const initialState: InteractionState = {
  list: [],
  detail: null,
  total: 0,
  page: 1,
  size: 10,
  pages: 1,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  filters: {
    customer_id: undefined,
    type: undefined,
    date_from: undefined,
    date_to: undefined,
    page: 1,
    size: 10,
  },
};

export const fetchInteractions = createAsyncThunk<
  PaginatedResponse<Interaction>,
  InteractionFilters | undefined,
  { rejectValue: string }
>('interactions/fetchInteractions', async (filters, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<Interaction[]>>('/api/interactions', {
      params: filters,
    });
    const items = response.data.data || [];
    const meta = response.data.meta;
    return {
      items,
      total: meta?.total ?? items.length,
      page: meta?.page ?? (filters?.page || 1),
      size: meta?.size ?? (filters?.size || 10),
      pages: meta?.pages ?? 1,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch interactions'
    );
  }
});

export const fetchInteractionById = createAsyncThunk<Interaction, string, { rejectValue: string }>(
  'interactions/fetchInteractionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Interaction>>(`/api/interactions/${id}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch interaction'
      );
    }
  }
);

export const createInteraction = createAsyncThunk<
  Interaction & { _apiMessage?: string },
  Partial<Interaction> & { auto_generate_insights?: boolean },
  { rejectValue: string }
>('interactions/createInteraction', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<Interaction>>('/api/interactions', data);
    return {
      ...response.data.data,
      _apiMessage: response.data.message,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.response?.data?.detail || 'Failed to create interaction'
    );
  }
});

export const updateInteraction = createAsyncThunk<
  Interaction,
  { id: string; data: Partial<Interaction> },
  { rejectValue: string }
>('interactions/updateInteraction', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put<ApiResponse<Interaction>>(`/api/interactions/${id}`, data);
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.response?.data?.detail || 'Failed to update interaction'
    );
  }
});

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    setInteractionFilters: (state, action: PayloadAction<Partial<InteractionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearInteractionDetail: (state) => {
      state.detail = null;
    },
    clearInteractionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.pages = action.payload.pages;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load interactions';
      })
      // Fetch Detail
      .addCase(fetchInteractionById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchInteractionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchInteractionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load interaction';
      })
      // Create
      .addCase(createInteraction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create interaction';
      })
      // Update
      .addCase(updateInteraction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail && state.detail.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update interaction';
      });
  },
});

export const { setInteractionFilters, clearInteractionDetail, clearInteractionError } =
  interactionSlice.actions;
export default interactionSlice.reducer;

