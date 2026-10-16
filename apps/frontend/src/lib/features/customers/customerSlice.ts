import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Customer, CustomerFilters, PaginatedResponse, ApiResponse } from '@/types';

export interface CustomerState {
  list: Customer[];
  detail: Customer | null;
  total: number;
  page: number;
  size: number;
  pages: number;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  filters: CustomerFilters;
}

const initialState: CustomerState = {
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
    status: undefined,
    search: '',
    page: 1,
    size: 10,
  },
};

export const fetchCustomers = createAsyncThunk<
  PaginatedResponse<Customer>,
  CustomerFilters | undefined,
  { rejectValue: string }
>('customers/fetchCustomers', async (filters, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<Customer[]>>('/api/customers', {
      params: filters,
    });
    return {
      items: response.data.data || [],
      total: response.data.meta?.total || 0,
      page: response.data.meta?.page || 1,
      size: response.data.meta?.size || 10,
      pages: response.data.meta?.pages || 1,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch customers');
  }
});

export const fetchCustomerById = createAsyncThunk<Customer, string, { rejectValue: string }>(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Customer>>(`/api/customers/${id}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch customer details'
      );
    }
  }
);

export const createCustomer = createAsyncThunk<Customer, Partial<Customer>, { rejectValue: string }>(
  'customers/createCustomer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Customer>>('/api/customers', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk<
  Customer,
  { id: string; data: Partial<Customer> },
  { rejectValue: string }
>('customers/updateCustomer', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put<ApiResponse<Customer>>(`/api/customers/${id}`, data);
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || 'Failed to update customer');
  }
});

export const deleteCustomer = createAsyncThunk<string, string, { rejectValue: string }>(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete<ApiResponse<null>>(`/api/customers/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || 'Failed to delete customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomerFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCustomerDetail: (state) => {
      state.detail = null;
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load customers';
      })
      // Fetch Detail
      .addCase(fetchCustomerById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load customer';
      })
      // Create
      .addCase(createCustomer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create customer';
      })
      // Update
      .addCase(updateCustomer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail && state.detail.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update customer';
      })
      // Delete
      .addCase(deleteCustomer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter((c) => c.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.detail && state.detail.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to delete customer';
      });
  },
});

export const { setCustomerFilters, clearCustomerDetail, clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;

