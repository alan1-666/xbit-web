import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchMarketData = createAsyncThunk(
  'market/fetch',
  async (symbol: string) => {
    const res = await fetch(`/api/market?symbol=${symbol}`);
    return res.json();
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    data: null,
    loading: 'idle'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketData.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = 'succeeded';
      });
  }
});

export default marketSlice.reducer;