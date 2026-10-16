import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { AIInsight, ApiResponse } from '@/types';

export interface InsightState {
  insight: AIInsight | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: InsightState = {
  insight: null,
  loading: false,
  generating: false,
  error: null,
};

export const fetchInsight = createAsyncThunk<AIInsight, string, { rejectValue: string }>(
  'insights/fetchInsight',
  async (interactionId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<AIInsight>>(`/api/interactions/${interactionId}/insights`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch AI insights'
      );
    }
  }
);

export const generateInsight = createAsyncThunk<
  AIInsight & { _apiMessage?: string },
  { interactionId: string; customNotes?: string },
  { rejectValue: string }
>('insights/generateInsight', async ({ interactionId, customNotes }, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<AIInsight>>(`/api/interactions/${interactionId}/insights`, {
      custom_notes: customNotes,
    });
    return {
      ...response.data.data,
      _apiMessage: response.data.message,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.response?.data?.detail || 'Failed to generate AI insights'
    );
  }
});

const insightSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    clearInsight: (state) => {
      state.insight = null;
      state.error = null;
    },
    clearInsightError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Insight
      .addCase(fetchInsight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsight.fulfilled, (state, action) => {
        state.loading = false;
        state.insight = action.payload;
      })
      .addCase(fetchInsight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch insight';
      })
      // Generate Insight
      .addCase(generateInsight.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateInsight.fulfilled, (state, action) => {
        state.generating = false;
        state.insight = action.payload;
      })
      .addCase(generateInsight.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload || 'Failed to generate insight';
      });
  },
});

export const { clearInsight, clearInsightError } = insightSlice.actions;
export default insightSlice.reducer;

