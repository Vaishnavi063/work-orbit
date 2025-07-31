import { useState } from "react";
import useGetProjects from "./hooks/use-get-projects";
import ProjectCard from "./components/project-card";
import ProjectFilters, { type SortConfig } from "./components/projects-filters";
import { FullscreenLoader } from "@/components/shared/full-screen-loader";
import type { Project } from "@/types";

const BrowseProjects = () => {
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const { projects, isLoading, error } = useGetProjects(searchText, sortConfig);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const openProjects = safeProjects.filter(
    (project) => project.status === "OPEN"
  );

  const handleSortChange = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
  };

  if (isLoading) {
    return <FullscreenLoader lable="Projects Loading..." />;
  }

  return (
    <section className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-800">Browse Projects</h1>
        <ProjectFilters
          onSearch={setSearchText}
          onSort={handleSortChange}
          currentSort={sortConfig}
        />
      </div>

      {/* Results Summary */}
      {!error && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {openProjects.length} open project
            {openProjects.length !== 1 ? "s" : ""} found
          </span>
          <span className="hidden sm:inline">
            Sorted by {sortConfig.sortBy} (
            {sortConfig.sortDir === "asc" ? "ascending" : "descending"})
          </span>
        </div>
      )}

      {error ? (
        <div className="w-full text-red-500 font-medium text-center py-8">
          Failed to load projects. Please try again.
        </div>
      ) : openProjects.length === 0 ? (
        <div className="w-full text-gray-500 text-center py-8">
          {searchText
            ? `No open projects found for "${searchText}".`
            : "No open projects found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {openProjects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BrowseProjects;
