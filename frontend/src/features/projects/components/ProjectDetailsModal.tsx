import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  DollarSignIcon, 
  TagIcon, 
  UserIcon, 
  ClockIcon,
  XIcon,
  LoaderCircle
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import type { Project } from "../types";
import BidList from "./BidList";
import { 
  fetchProjectDetails,
  clearCurrentProject,
  selectCurrentProject,
  selectCurrentProjectBids,
  selectProjectsLoading,
  selectProjectsError
} from "@/store/slices/projects-slice";
import type { RootState, AppDispatch } from "@/store";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentProject = useSelector(selectCurrentProject);
  const currentProjectBids = useSelector(selectCurrentProjectBids);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const { authToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isOpen && project && authToken) {
      dispatch(fetchProjectDetails({ 
        projectId: project.id, 
        authToken 
      }));
    }
  }, [isOpen, project, authToken, dispatch]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(clearCurrentProject());
    }
  }, [isOpen, dispatch]);

  const handleClose = () => {
    onClose();
  };

  const projectToDisplay = currentProject || project;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">
                {projectToDisplay?.title || "Project Details"}
              </DialogTitle>
              {projectToDisplay && (
                <div className="flex items-center gap-2">
                  <Badge variant={projectToDisplay.status === "OPEN" ? "default" : "secondary"}>
                    {projectToDisplay.status}
                  </Badge>
                  <Badge variant="outline">
                    {projectToDisplay.category}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {loading.projectDetails ? (
            <ProjectDetailsModalSkeleton />
          ) : error.projectDetails ? (
            <ProjectDetailsModalError 
              error={error.projectDetails} 
              onRetry={() => project && authToken && dispatch(fetchProjectDetails({ 
                projectId: project.id, 
                authToken 
              }))}
            />
          ) : projectToDisplay ? (
            <ProjectDetailsContent 
              project={projectToDisplay}
              bids={currentProjectBids}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No project data available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
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
    <div className="space-y-6 pb-6">
      {/* Project Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">${project.budget.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold">{formatDeadline(project.deadline)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <TagIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-semibold">{project.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Client ID</p>
              <p className="font-semibold">#{project.clientId}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Project Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Description</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      </div>

      <Separator />

      {/* Project Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(project.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bids Section */}
      <div className="space-y-4">
        <BidList 
          bids={bids}
          projectStatus={project.status}
          projectId={project.id}
        />
      </div>
    </div>
  );
};

const ProjectDetailsModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-6">
      {/* Overview skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Description skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <Separator />

      {/* Timeline skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bids skeleton */}
      <div className="space-y-4">
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
      </div>
    </div>
  );
};

interface ProjectDetailsModalErrorProps {
  error: string;
  onRetry: () => void;
}

const ProjectDetailsModalError: React.FC<ProjectDetailsModalErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-4">
        <XIcon className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load project details</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error}
      </p>
      <Button onClick={onRetry} variant="outline">
        <LoaderCircle className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};

export default ProjectDetailsModal;