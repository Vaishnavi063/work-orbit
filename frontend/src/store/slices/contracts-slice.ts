import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { 
  type Contract, 
  type ApiResponse, 
  ContractStatus,
  type ContractStatusUpdateRequest
} from "@/features/contracts/types";
import contractApis from "@/features/contracts/apis";
import type { RootState } from "../index";
import { extractErrorMessage } from "@/utils/error-handler";

/**
 * Contracts state interface
 */
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

/**
 * Initial state for contracts slice
 */
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

/**
 * Async thunk to fetch all contracts
 */
export const fetchContracts = createAsyncThunk(
  "contracts/fetchContracts",
  async (authToken: string, { rejectWithValue }) => {
    try {
      const response = await contractApis.getContracts({ authToken });
      
      // Check if the API returned an error status
      if (response.data.status === "error") {
        return rejectWithValue(response.data.error || "Failed to fetch contracts");
      }
      
      return response.data as ApiResponse<Contract[]>;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error fetching contracts:", error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to fetch a contract by ID
 */
export const fetchContractById = createAsyncThunk(
  "contracts/fetchContractById",
  async ({ contractId, authToken }: { contractId: number; authToken: string }, { rejectWithValue }) => {
    try {
      const response = await contractApis.getContractById({ 
        params: { id: contractId }, 
        authToken 
      });
      
      // Check if the API returned an error status
      if (response.data.status === "error") {
        return rejectWithValue(response.data.error || "Failed to fetch contract details");
      }
      
      return response.data as ApiResponse<Contract>;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      console.error(`Error fetching contract ${contractId}:`, error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to update a contract's status
 */
export const updateContractStatus = createAsyncThunk(
  "contracts/updateContractStatus",
  async ({ 
    contractId, 
    status, 
    authToken 
  }: { 
    contractId: number; 
    status: ContractStatus; 
    authToken: string 
  }, { rejectWithValue }) => {
    try {
      // Validate input before making the API call
      if (!contractId || !status || !authToken) {
        return rejectWithValue("Missing required information to update contract status");
      }
      
      const data: ContractStatusUpdateRequest = {
        contractStatus: status
      };
      
      const response = await contractApis.updateContractStatus({ 
        params: { id: contractId }, 
        data, 
        authToken 
      });
      
      // Check if the API returned an error status
      if (response.data.status === "error") {
        return rejectWithValue(response.data.error || "Failed to update contract status");
      }
      
      return response.data as ApiResponse<Contract>;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      console.error(`Error updating contract ${contractId} status:`, error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to delete a contract
 */
export const deleteContract = createAsyncThunk(
  "contracts/deleteContract",
  async ({ contractId, authToken }: { contractId: number; authToken: string }, { rejectWithValue }) => {
    try {
      // Validate input before making the API call
      if (!contractId || !authToken) {
        return rejectWithValue("Missing required information to delete contract");
      }
      
      const response = await contractApis.deleteContract({ 
        params: { id: contractId }, 
        authToken 
      });
      
      // Check if the API returned an error status
      if (response.data.status === "error") {
        return rejectWithValue(response.data.error || "Failed to delete contract");
      }
      
      return { 
        response: response.data as ApiResponse<void>,
        contractId 
      };
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      console.error(`Error deleting contract ${contractId}:`, error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Contracts slice
 */
const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearContractErrors: (state) => {
      state.error = {
        contracts: null,
        contractDetails: null,
        updateStatus: null,
        deleteContract: null,
      };
    },
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
    updateContractStatusOptimistic: (state, action: PayloadAction<{ contractId: number; status: ContractStatus }>) => {
      const { contractId, status } = action.payload;
      
      // Update in contracts list
      const contract = state.contracts.find(c => c.contractId === contractId);
      if (contract) {
        contract.contractStatus = status;
        contract.updatedAt = new Date().toISOString();
      }
      
      // Update current contract if it's the one being modified
      if (state.currentContract && state.currentContract.contractId === contractId) {
        state.currentContract.contractStatus = status;
        state.currentContract.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch contracts reducers
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading.contracts = true;
        state.error.contracts = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
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
      });

    // Fetch contract by ID reducers
    builder
      .addCase(fetchContractById.pending, (state) => {
        state.loading.contractDetails = true;
        state.error.contractDetails = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
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
      });

    // Update contract status reducers
    builder
      .addCase(updateContractStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
      })
      .addCase(updateContractStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        if (action.payload.status === "success" && action.payload.data) {
          // Update the contract in the contracts list
          const updatedContract = action.payload.data;
          const index = state.contracts.findIndex(c => c.contractId === updatedContract.contractId);
          
          if (index !== -1) {
            state.contracts[index] = updatedContract;
          }
          
          // Update current contract if it's the one being modified
          if (state.currentContract && state.currentContract.contractId === updatedContract.contractId) {
            state.currentContract = updatedContract;
          }
        } else {
          state.error.updateStatus = action.payload.error || "Failed to update contract status";
        }
      })
      .addCase(updateContractStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error.updateStatus = action.payload as string;
      });

    // Delete contract reducers
    builder
      .addCase(deleteContract.pending, (state) => {
        state.loading.deleteContract = true;
        state.error.deleteContract = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading.deleteContract = false;
        const { response, contractId } = action.payload;
        
        if (response.status === "success") {
          // Remove the contract from the contracts list
          state.contracts = state.contracts.filter(c => c.contractId !== contractId);
          
          // Clear current contract if it's the one being deleted
          if (state.currentContract && state.currentContract.contractId === contractId) {
            state.currentContract = null;
          }
        } else {
          state.error.deleteContract = response.error || "Failed to delete contract";
        }
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading.deleteContract = false;
        state.error.deleteContract = action.payload as string;
      });
  },
});

// Export actions
export const { 
  clearContractErrors, 
  clearCurrentContract, 
  updateContractStatusOptimistic 
} = contractsSlice.actions;

// Selectors
export const selectContracts = (state: RootState) => state.contracts.contracts;
export const selectCurrentContract = (state: RootState) => state.contracts.currentContract;
export const selectContractsLoading = (state: RootState) => state.contracts.loading;
export const selectContractsError = (state: RootState) => state.contracts.error;

// Filter selectors
export const selectContractsByStatus = (status: ContractStatus | null) => (state: RootState) => {
  if (status === null) {
    return state.contracts.contracts; // Return all contracts
  }
  return state.contracts.contracts.filter(contract => contract.contractStatus === status);
};

export const selectInProgressContracts = (state: RootState) => 
  state.contracts.contracts.filter(contract => contract.contractStatus === ContractStatus.IN_PROGRESS);

export const selectCompletedContracts = (state: RootState) => 
  state.contracts.contracts.filter(contract => contract.contractStatus === ContractStatus.COMPLETED);

export const selectContractById = (contractId: number) => (state: RootState) =>
  state.contracts.contracts.find(contract => contract.contractId === contractId);

// Export reducer
export default contractsSlice.reducer;