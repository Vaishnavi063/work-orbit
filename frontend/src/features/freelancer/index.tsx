import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

import useGetProjects from "./hooks/use-get-projects";
import ProjectCard from "./components/project-card";
import ProjectFilters from "./components/projects-filters";

import type { Project } from "@/types";

const ProjectSkeleton = () => (
  <Card className="flex-shrink-0 w-full max-w-sm p-6 rounded-2xl shadow-sm bg-white border border-gray-200">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter className="flex flex-col gap-2 items-start">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-full" />
    </CardFooter>
  </Card>
);

// 📦 Main Component
const BrowseProjects = () => {
  const { projects, refetch, isLoading, error } = useGetProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const openProjects = safeProjects.filter(
    (project) => project.status === "OPEN"
  );

  return (
    <TooltipProvider>
      <section className="space-y-6 py-4">
        {/* 🔍 Header and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">
            Browse Projects
          </h1>
          <ProjectFilters />
        </div>

        {/* 📊 Project List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="w-full text-red-500 font-medium text-center">
            Failed to load projects. Please try again.
          </div>
        ) : openProjects.length === 0 ? (
          <div className="w-full text-gray-500 text-center">
            No open projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {openProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </TooltipProvider>
  );
};

export default BrowseProjects;
