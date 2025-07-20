import React from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import {
    CalendarIcon,
    DollarSignIcon,
    EyeIcon,
    MessageSquareIcon,
    PlusIcon,
} from "lucide-react";

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
import {
    selectProjects,
    selectProjectsLoading,
} from "@/store/slices/projects-slice";
import type { RootState } from "@/store";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useNavigate } from "react-router-dom";

interface ProjectListProps {
    filterStatus?: "OPEN" | "CLOSED";
}

const ProjectList: React.FC<ProjectListProps> = ({
    filterStatus,
}) => {
    const loading = useSelector(selectProjectsLoading);
    const projects = useSelector(selectProjects);
    const { user } = useSelector((state: RootState) => state.auth);

    const clientProjects = projects.filter(
        (project) => project.clientId === user?.id
    );

    const filteredProjects = filterStatus
        ? clientProjects.filter((project) => project.status === filterStatus)
        : clientProjects;

    if (loading.projects) {
        return <ProjectListSkeleton />;
    }

    if (filteredProjects.length === 0) {
        return <EmptyProjectList status={filterStatus} />;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                />
            ))}
        </div>
    );
};

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
}) => {
    const { handleError } = useErrorHandler();
    const navigate = useNavigate();

    const handleViewDetails = () => {
        try {
            navigate(`${project.id}`);
        } catch (error) {
            handleError(error as Error, {
                toastTitle: "Error opening project",
                showToast: true,
            });
        }
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

    return (
        <Card className="hover:shadow-md transition-shadow h-full flex flex-col border-t-4 border-t-primary/80 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                            {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant={getStatusColor(project.status)} className="capitalize">
                                {project.status.toLowerCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-slate-50">
                                {project.category}
                            </Badge>
                        </div>
                    </div>
                </div>
                <CardDescription className="text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                    {project.description}
                </CardDescription>
            </CardHeader>

            <div className="mt-auto">
                <CardContent className="space-y-3 pb-0">
                    <div className="grid grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2 col-span-2">
                            <div className="bg-blue-50 p-1.5 rounded-full">
                                <DollarSignIcon className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="font-medium">
                                {project.budget.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-3">
                            <div className="bg-green-50 p-1.5 rounded-full">
                                <CalendarIcon className="h-3.5 w-3.5 text-green-500" />
                            </div>
                            <span className="whitespace-nowrap">{formatDeadline(project.deadline)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="bg-purple-50 p-1.5 rounded-full">
                            <MessageSquareIcon className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <span>
                            {project.bidCount || 0} bid
                            {(project.bidCount || 0) !== 1 ? "s" : ""} received
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 pb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewDetails}
                        className="w-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
};

const ProjectListSkeleton: React.FC = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-t-4 border-t-muted">
                    <CardHeader>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="flex gap-2 mb-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </CardHeader>
                    <div className="mt-auto">
                        <CardContent className="space-y-3 pb-0">
                            <div className="grid grid-cols-5 gap-4">
                                <div className="flex items-center gap-2 col-span-2">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex items-center gap-2 col-span-3">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardContent>
                        <CardFooter className="pt-3 pb-3">
                            <Skeleton className="h-8 w-full" />
                        </CardFooter>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const EmptyProjectList: React.FC<{ status?: "OPEN" | "CLOSED" }> = ({
    status,
}) => {
    let message =
        "You haven't posted any projects yet. Create your first project to start receiving bids from talented freelancers.";

    if (status === "OPEN") {
        message =
            "You don't have any open projects. Create a new project to start receiving bids.";
    } else if (status === "CLOSED") {
        message =
            "You don't have any closed projects. Projects will appear here after you accept a bid.";
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border shadow-sm p-6">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
                <MessageSquareIcon className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
            <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors cursor-pointer">
                <PlusIcon className="mr-2 h-4 w-4" />
                Post Your First Project
            </Button>
        </div>
    );
};

export default ProjectList;
