import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
  Project, 
  BidResponse, 
  ApiResponse, 
  ProjectCreateRequest,
  BidActionRequest 
} from "@/features/projects/types";
import projectApis from "@/features/projects/apis";
import type { RootState } from "../index";

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectBids: BidResponse[];
  loading: {
    projects: boolean;
    createProject: boolean;
    projectDetails: boolean;
    bidAction: boolean;
  };
  error: {
    projects: string | null;
    createProject: string | null;
    projectDetails: string | null;
    bidAction: string | null;
  };
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  currentProjectBids: [],
  loading: {
    projects: false,
    createProject: false,
    projectDetails: false,
    bidAction: false,
  },
  error: {
    projects: null,
    createProject: null,
    projectDetails: null,
    bidAction: null,
  },
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (authToken: string, { rejectWithValue }) => {
    try {
      const response = await projectApis.getProjects({ authToken });
      return response.data as ApiResponse<Project[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch projects");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async ({ data, authToken }: { data: ProjectCreateRequest; authToken: string }, { rejectWithValue }) => {
    try {
      const response = await projectApis.createProject({ data, authToken });
      return response.data as ApiResponse<Project>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create project");
    }
  }
);

export const fetchProjectDetails = createAsyncThunk(
  "projects/fetchProjectDetails",
  async ({ projectId, authToken }: { projectId: number; authToken: string }, { rejectWithValue }) => {
    try {
      const [projectResponse, bidsResponse] = await Promise.all([
        projectApis.getProjectById({ params: { id: projectId }, authToken }),
        projectApis.getProjectBids({ params: { projectId }, authToken })
      ]);
      
      return {
        project: projectResponse.data as ApiResponse<Project>,
        bids: bidsResponse.data as ApiResponse<BidResponse[]>
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch project details");
    }
  }
);

export const acceptBid = createAsyncThunk(
  "projects/acceptBid",
  async ({ projectId, bidId, authToken }: BidActionRequest & { authToken: string }, { rejectWithValue }) => {
    try {
      const response = await projectApis.acceptBid({ params: { projectId, bidId }, authToken });
      return { 
        response: response.data as ApiResponse<string>,
        projectId,
        bidId 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to accept bid");
    }
  }
);

export const rejectBid = createAsyncThunk(
  "projects/rejectBid",
  async ({ projectId, bidId, authToken }: BidActionRequest & { authToken: string }, { rejectWithValue }) => {
    try {
      const response = await projectApis.rejectBid({ params: { projectId, bidId }, authToken });
      return { 
        response: response.data as ApiResponse<string>,
        projectId,
        bidId 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to reject bid");
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectErrors: (state) => {
      state.error = {
        projects: null,
        createProject: null,
        projectDetails: null,
        bidAction: null,
      };
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.currentProjectBids = [];
    },
    addProjectOptimistic: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
    updateBidStatusOptimistic: (state, action: PayloadAction<{ bidId: number; status: "Pending" | "Accepted" | "Rejected" }>) => {
      const { bidId, status } = action.payload;
      const bid = state.currentProjectBids.find(b => b.bidId === bidId);
      if (bid) {
        bid.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading.projects = true;
        state.error.projects = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading.projects = false;
        if (action.payload.status === "success" && action.payload.data) {
          state.projects = action.payload.data;
        } else {
          state.error.projects = action.payload.error || "Failed to fetch projects";
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading.projects = false;
        state.error.projects = action.payload as string;
      });

    builder
      .addCase(createProject.pending, (state) => {
        state.loading.createProject = true;
        state.error.createProject = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading.createProject = false;
        if (action.payload.status === "success" && action.payload.data) {
          state.projects = state.projects.filter(p => p.id !== -1);
          state.projects.unshift(action.payload.data);
        } else {
          state.error.createProject = action.payload.error || "Failed to create project";
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading.createProject = false;
        state.error.createProject = action.payload as string;
        state.projects = state.projects.filter(p => p.id !== -1);
      });

    builder
      .addCase(fetchProjectDetails.pending, (state) => {
        state.loading.projectDetails = true;
        state.error.projectDetails = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.loading.projectDetails = false;
        const { project, bids } = action.payload;
        
        if (project.status === "success" && project.data) {
          state.currentProject = project.data;
        }
        
        if (bids.status === "success" && bids.data) {
          state.currentProjectBids = bids.data;
        }
        
        if (project.status === "error" || bids.status === "error") {
          state.error.projectDetails = project.error || bids.error || "Failed to fetch project details";
        }
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.loading.projectDetails = false;
        state.error.projectDetails = action.payload as string;
      });

    builder
      .addCase(acceptBid.pending, (state) => {
        state.loading.bidAction = true;
        state.error.bidAction = null;
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.loading.bidAction = false;
        const { response, projectId, bidId } = action.payload;
        
        if (response.status === "success") {
          const bid = state.currentProjectBids.find(b => b.bidId === bidId);
          if (bid) {
            bid.status = "Accepted";
          }
          
          if (state.currentProject && state.currentProject.id === projectId) {
            state.currentProject.status = "CLOSED";
          }
          
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            project.status = "CLOSED";
          }
        } else {
          state.error.bidAction = response.error || "Failed to accept bid";
        }
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.loading.bidAction = false;
        state.error.bidAction = action.payload as string;
      });

    builder
      .addCase(rejectBid.pending, (state) => {
        state.loading.bidAction = true;
        state.error.bidAction = null;
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.loading.bidAction = false;
        const { response, bidId } = action.payload;
        
        if (response.status === "success") {
          // Update bid status
          const bid = state.currentProjectBids.find(b => b.bidId === bidId);
          if (bid) {
            bid.status = "Rejected";
          }
        } else {
          state.error.bidAction = response.error || "Failed to reject bid";
        }
      })
      .addCase(rejectBid.rejected, (state, action) => {
        state.loading.bidAction = false;
        state.error.bidAction = action.payload as string;
      });
  },
});

export const { 
  clearProjectErrors, 
  clearCurrentProject, 
  addProjectOptimistic, 
  updateBidStatusOptimistic 
} = projectsSlice.actions;

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectCurrentProject = (state: RootState) => state.projects.currentProject;
export const selectCurrentProjectBids = (state: RootState) => state.projects.currentProjectBids;
export const selectProjectsLoading = (state: RootState) => state.projects.loading;
export const selectProjectsError = (state: RootState) => state.projects.error;

export const selectClientProjects = (clientId: number | undefined) => (state: RootState) => {
  if (!clientId) return [];
  return state.projects.projects.filter(project => project.clientId === clientId);
};

export const selectClientProjectsWithStats = (clientId: number | undefined) => (state: RootState) => {
  if (!clientId) return { projects: [], totalProjects: 0, openProjects: 0, totalBids: 0 };
  
  const clientProjects = state.projects.projects.filter(project => project.clientId === clientId);
  const openProjects = clientProjects.filter(project => project.status === "OPEN").length;
  const totalBids = clientProjects.reduce((total, project) => total + (project.bidCount || 0), 0);
  
  return {
    projects: clientProjects,
    totalProjects: clientProjects.length,
    openProjects,
    totalBids
  };
};

export const selectProjectById = (projectId: number) => (state: RootState) =>
  state.projects.projects.find(project => project.id === projectId);

export const selectOpenProjects = (state: RootState) =>
  state.projects.projects.filter(project => project.status === "OPEN");

export const selectClosedProjects = (state: RootState) =>
  state.projects.projects.filter(project => project.status === "CLOSED");

export const selectClientOpenProjects = (clientId: number | undefined) => (state: RootState) => {
  if (!clientId) return [];
  return state.projects.projects.filter(project => 
    project.clientId === clientId && project.status === "OPEN"
  );
};

export const selectClientClosedProjects = (clientId: number | undefined) => (state: RootState) => {
  if (!clientId) return [];
  return state.projects.projects.filter(project => 
    project.clientId === clientId && project.status === "CLOSED"
  );
};

export default projectsSlice.reducer;