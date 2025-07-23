import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { ApiResponse, Contract } from "@/features/contracts/types";
import apis from "@/features/contracts/apis";

// Note: Removed incorrect import for "@/utils/error-handler"

interface ContractsState {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: {
    contracts: boolean;
    contractDetails: boolean;
    updateStatus: boolean;
    deleteContract: boolean;
  };
  error: {
    contracts: string | null;
    contractDetails: string | null;
    updateStatus: string | null;
    deleteContract: string | null;
  };
}

const initialState: ContractsState = {
  contracts: [],
  currentContract: null,
  loading: {
    contracts: false,
    contractDetails: false,
    updateStatus: false,
    deleteContract: false,
  },
  error: {
    contracts: null,
    contractDetails: null,
    updateStatus: null,
    deleteContract: null,
  },
};

export const fetchContracts = createAsyncThunk(
  "contracts/fetchContracts",
  async (authToken: string, { rejectWithValue }) => {
    try {
      const response = await apis.getContracts({ authToken });
      return response.data as ApiResponse<Contract[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch contracts");
    }
  }
);

export const fetchContractById = createAsyncThunk(
  "contracts/fetchContractDetails",
  async ({ contractId, authToken }: { contractId: number; authToken: string }, { rejectWithValue }) => {
    try {
      const response = await apis.getContractById({ params: { id: contractId }, authToken });
      return response.data as ApiResponse<Contract>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch contract details");
    }
  }
);

export const updateContractStatus = createAsyncThunk(
  "contracts/updateContractStatus",
  async ({ contractId, data, authToken, options }: { 
    contractId: number; 
    data: string; // Changed from ContractStatusUpdateRequest to string
    authToken: string;
    options?: { isPlainText?: boolean };
  }, { rejectWithValue }) => {
    try {
      const response = await apis.updateContractStatus({ 
        params: { id: contractId }, 
        data: options?.isPlainText ? data : { contractStatus: data },
        authToken,
        isPlainText: options?.isPlainText
      });
      return response.data as ApiResponse<Contract>;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update contract status";
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An unknown error occurred');
    }
  }
);

export const deleteContract = createAsyncThunk(
  "contracts/deleteContract",
  async ({ contractId, authToken }: { contractId: number; authToken: string }, { rejectWithValue }) => {
    try {
      await apis.deleteContract({ params: { id: contractId }, authToken });
      return contractId; // Return ID for optimistic update
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete contract");
    }
  }
);

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearCurrentContract(state) {
      state.currentContract = null;
    },
    clearContractErrors(state) {
      state.error = {
        contracts: null,
        contractDetails: null,
        updateStatus: null,
        deleteContract: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Contracts
      .addCase(fetchContracts.pending, (state) => {
        state.loading.contracts = true;
        state.error.contracts = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action: PayloadAction<ApiResponse<Contract[]>>) => {
        state.loading.contracts = false;
        if (action.payload.status === "success" && action.payload.data) {
          state.contracts = action.payload.data;
        } else {
          state.error.contracts = action.payload.error || "Failed to fetch contracts";
        }
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading.contracts = false;
        state.error.contracts = action.payload as string;
      })

      // Fetch Contract Details
      .addCase(fetchContractById.pending, (state) => {
        state.loading.contractDetails = true;
        state.error.contractDetails = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action: PayloadAction<ApiResponse<Contract>>) => {
        state.loading.contractDetails = false;
        if (action.payload.status === "success" && action.payload.data) {
          state.currentContract = action.payload.data;
        } else {
          state.error.contractDetails = action.payload.error || "Failed to fetch contract details";
        }
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading.contractDetails = false;
        state.error.contractDetails = action.payload as string;
      })

      // Update Contract Status
      .addCase(updateContractStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
      })
      .addCase(updateContractStatus.fulfilled, (state, action: PayloadAction<ApiResponse<Contract>>) => {
        state.loading.updateStatus = false;
        if (action.payload.status === 'success' && action.payload.data) {
          const updatedContract = action.payload.data;
          // Update in the main list
          const index = state.contracts.findIndex(c => c.contractId === updatedContract.contractId);
          if (index !== -1) {
            state.contracts[index] = updatedContract;
          }
          // Update the current contract if it's the one being viewed
          if (state.currentContract?.contractId === updatedContract.contractId) {
            state.currentContract = updatedContract;
          }
        } else {
          state.error.updateStatus = action.payload.error || "Failed to update status";
        }
      })
      .addCase(updateContractStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        const payload = action.payload as { message?: string } | string | undefined;
        state.error.updateStatus = typeof payload === 'object' && payload !== null && 'message' in payload
          ? payload.message || 'Failed to update contract status'
          : (payload as string) || 'An unknown error occurred';
      })

      // Delete Contract
      .addCase(deleteContract.pending, (state) => {
        state.loading.deleteContract = true;
        state.error.deleteContract = null;
      })
      .addCase(deleteContract.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading.deleteContract = false;
        state.contracts = state.contracts.filter(c => c.contractId !== action.payload);
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading.deleteContract = false;
        state.error.deleteContract = action.payload as string;
      });
  },
});

export const { clearCurrentContract, clearContractErrors } = contractsSlice.actions;

// Selectors
export const selectContracts = (state: RootState) => {
  const { contracts } = state.contracts;
  const currentUser = state.auth.user;
  
  if (!currentUser) {
    return [];
  }

  return contracts.filter(contract => {
    // For clients, check if clientId matches
    if (currentUser.role === 'ROLE_CLIENT' && contract.clientId === currentUser.id) {
      return true;
    }
    // For freelancers, check if freelancerId matches
    if (currentUser.role === 'ROLE_FREELANCER' && contract.freelancerId === currentUser.id) {
      return true;
    }
    return false;
  });
};
export const selectCurrentContract = (state: RootState) => state.contracts.currentContract;
export const selectContractsLoading = (state: RootState) => state.contracts.loading;
export const selectContractsError = (state: RootState) => state.contracts.error;

export default contractsSlice.reducer;