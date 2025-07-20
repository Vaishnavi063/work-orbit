import React from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { CalendarIcon, DollarSignIcon, EyeIcon, MessageSquareIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { Project } from "../types";
import { selectProjects, selectProjectsLoading } from "@/store/slices/projects-slice";
import type { RootState } from "@/store";

interface ProjectListProps {
  onViewDetails?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onViewDetails }) => {
  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectsLoading);
  const { user } = useSelector((state: RootState) => state.auth);

  const clientProjects = projects.filter(project => project.clientId === user?.id);

  if (loading.projects) {
    return <ProjectListSkeleton />;
  }

  if (clientProjects.length === 0) {
    return <EmptyProjectList />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clientProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails }) => {
  const handleViewDetails = () => {
    onViewDetails?.(project);
  };

  const getStatusColor = (status: Project["status"]) => {
    return status === "OPEN" ? "default" : "secondary";
  };

  const formatDeadline = (deadline: string) => {
    try {
      return format(new Date(deadline), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {project.category}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {truncateDescription(project.description)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget and Deadline */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">${project.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{formatDeadline(project.deadline)}</span>
          </div>
        </div>

        {/* Bid Count */}
        <div className="flex items-center gap-2 text-sm">
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          <span>
            {project.bidCount || 0} bid{(project.bidCount || 0) !== 1 ? "s" : ""} received
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="w-full"
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const ProjectListSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

const EmptyProjectList: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <MessageSquareIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        You haven't posted any projects yet. Create your first project to start receiving bids from talented freelancers.
      </p>
      <Button variant="outline">
        <DollarSignIcon className="mr-2 h-4 w-4" />
        Post Your First Project
      </Button>
    </div>
  );
};

export default ProjectList;