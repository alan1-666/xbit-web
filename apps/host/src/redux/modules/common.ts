import { createAsyncThunk, GetThunkAPI } from '@reduxjs/toolkit';

export const createThunk = <Returned, ThunkArg>(
  typePrefix: string,
  payloadCreator: (arg: ThunkArg, thunkAPI: GetThunkAPI<any>) => Promise<Returned>,
) => {
  return createAsyncThunk<Returned, ThunkArg>(typePrefix, async (arg: ThunkArg, thunkAPI) => {
    try {
      return await payloadCreator(arg, thunkAPI);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  });
};
