import ProjectTable from "./components/project-table";
import useGetClientProjects from "./hooks/use-get-client-projects";

const MyProjects = () => {
  const { clientProjects, isLoading, refetch } = useGetClientProjects();
  const allClientProjects = clientProjects?.projects || [];

  return (
    <div className="px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        My Projects
      </h1>
      <ProjectTable
        projects={allClientProjects}
        isLoading={isLoading}
        refetchProjects={refetch}
      />
    </div>
  );
};

export default MyProjects;
