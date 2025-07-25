import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  TagIcon,
  ClockIcon,
  XIcon,
  LoaderCircle,
  ArrowLeftIcon,
  IndianRupee,
} from "lucide-react";

import { useErrorHandler } from "@/hooks/use-error-handler";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import type { Project } from "../types";
import BidList from "./BidList";
import {
  fetchProjectDetails,
  clearCurrentProject,
  selectCurrentProject,
  selectCurrentProjectBids,
  selectProjectsLoading,
  selectProjectsError,
  selectProjectById,
} from "@/store/slices/projects-slice";
import type { RootState, AppDispatch } from "@/store";

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const currentProject = useSelector(selectCurrentProject);
  const currentProjectBids = useSelector(selectCurrentProjectBids);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const { authToken } = useSelector((state: RootState) => state.auth);
  const { handleError } = useErrorHandler();

  // Try to get the project from the store first if it exists
  const projectFromStore = useSelector(selectProjectById(Number(projectId)));

  useEffect(() => {
    if (projectId && authToken) {
      dispatch(
        fetchProjectDetails({
          projectId: Number(projectId),
          authToken,
        })
      ).catch((err) => {
        handleError(err as Error, {
          toastTitle: "Failed to load project details",
          showToast: true,
        });
      });
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [projectId, authToken, dispatch, handleError]);

  const handleGoBack = () => {
    navigate("../");
  };

  const handleRetry = () => {
    if (projectId && authToken) {
      dispatch(
        fetchProjectDetails({
          projectId: Number(projectId),
          authToken,
        })
      ).catch((err) => {
        handleError(err as Error, {
          toastTitle: "Retry failed",
          showToast: true,
        });
      });
    }
  };

  const projectToDisplay = currentProject || projectFromStore;

  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      {loading.projectDetails ? (
        <ProjectDetailsSkeleton />
      ) : error.projectDetails ? (
        <ProjectDetailsError
          error={error.projectDetails}
          onRetry={handleRetry}
        />
      ) : projectToDisplay ? (
        <ProjectDetailsContent
          project={projectToDisplay}
          bids={currentProjectBids}
        />
      ) : (
        <div className="py-8 text-center text-muted-foreground bg-white rounded-lg shadow-sm border p-4">
          No project data available
        </div>
      )}
    </div>
  );
};

interface ProjectDetailsContentProps {
  project: Project;
  bids: any[];
}

const ProjectDetailsContent: React.FC<ProjectDetailsContentProps> = ({
  project,
  bids,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatDeadline = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
        <div className="flex items-center gap-2">
          <Badge
            variant={project.status === "OPEN" ? "default" : "secondary"}
            className="capitalize"
          >
            {project.status.toLowerCase()}
          </Badge>
          <Badge variant="outline" className="text-xs bg-slate-50">
            {project.category}
          </Badge>
        </div>
      </div>

      {/* Project Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">Project Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-6 h-full">
                <div className="bg-blue-50 p-3 rounded-full">
                  <IndianRupee className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {project.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-6 h-full">
                <div className="bg-green-50 p-3 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold">
                    {formatDeadline(project.deadline)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-6 h-full">
                <div className="bg-purple-50 p-3 rounded-full">
                  <TagIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{project.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Description */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Description</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Timeline */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <ClockIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(project.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <ClockIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bids Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <BidList
            bids={bids}
            projectStatus={project.status}
            projectId={project.id}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Overview skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Description skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bids skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProjectDetailsErrorProps {
  error: string;
  onRetry: () => void;
}

const ProjectDetailsError: React.FC<ProjectDetailsErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-6 mb-4">
            <XIcon className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Failed to load project details
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button
            onClick={onRetry}
            variant="outline"
            className="cursor-pointer"
          >
            <LoaderCircle className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
