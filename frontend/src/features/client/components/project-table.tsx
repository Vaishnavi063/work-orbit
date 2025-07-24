import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectRow from "./project-row";
import { FileWarning } from "lucide-react";

export type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  deadline: string;
  budget: number;
  status: string;
  client: {
    name: string;
    email: string;
  };
  bidCount: number;
};

interface Props {
  projects: Project[];
  isLoading: boolean;
  refetchProjects: () => void;
}

const ProjectTable = ({ projects, isLoading, refetchProjects }: Props) => {
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-muted shadow-sm overflow-x-auto bg-white">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-muted/40 border-b">
            {[
              "Title",
              "Category",
              "Budget",
              "Deadline",
              "Status",
              "Bids",
              "Actions",
            ].map((head, i) => (
              <TableHead
                key={i}
                className="font-semibold text-sm text-blue-600 border-r last:border-none text-center"
              >
                {head}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                refetchProjects={refetchProjects}
              />
            ))
          ) : (
            <TableRow>
              <td
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <FileWarning className="w-6 h-6 text-muted" />
                  <p>No projects found.</p>
                </div>
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
