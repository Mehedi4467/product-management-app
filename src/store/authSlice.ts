import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  email: null,
  loading: false,
  error: null,
};

// 🔹 Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await fetch("https://your-api-url.com/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to login");

      const data = await res.json();
      return { token: data.token, email };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.email = null;
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    },
    setAuthFromStorage: (state) => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      if (token) state.token = token;
      if (email) state.email = email;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ token: string; email: string }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.email = action.payload.email;
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("email", action.payload.email);
        }
      )
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
