import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Project } from "./project-table";
import {
  ProjectUpdateDialog,
  type ProjectUpdateData,
} from "./project-update-dialog";
import { useMutation } from "react-query";
import apis from "../apis";
import useAuth from "@/hooks/use-auth";
import { toast } from "sonner";

interface Props {
  project: Project;
  refetchProjects: () => void;
  onUpdate: (projectId: string, data: ProjectUpdateData) => void;
  isUpdating: boolean;
}

const ProjectRowWithUpdate = ({
  project,
  refetchProjects,
  onUpdate,
  isUpdating,
}: Props) => {
  const { authToken, user } = useAuth();
  const isClosed = project.status === "CLOSED";

  const { isLoading: isDeleting, mutate: deleteProject } = useMutation({
    mutationFn: (projectId: string) =>
      apis.deleteProject({ id: projectId, authToken: authToken! }),
    onSuccess: () => {
      refetchProjects();
      toast.success("🎉 Project deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete project";
      toast.error(`${errorMessage}`);
    },
  });

  const handleDeleteProject = () => {
    if (!authToken) {
      toast.error("Authentication required. Please log in again.");
      return;
    }
    deleteProject(project.id.toString());
  };

  return (
    <TableRow className="border-b border-border hover:bg-muted/40 transition-colors duration-150 ease-in-out">
      <TableCell className="font-medium border-r">{project.title}</TableCell>

      <TableCell className="text-sm text-muted-foreground border-r">
        {project.category}
      </TableCell>

      <TableCell className="text-sm border-r font-medium text-right">
        ₹{project.budget.toLocaleString("en-IN")}
      </TableCell>

      <TableCell className="text-sm border-r">
        {format(new Date(project.deadline), "MMM dd, yyyy")}
      </TableCell>

      <TableCell className="border-r">
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
            isClosed
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isClosed ? "Closed" : "Open"}
        </span>
      </TableCell>

      <TableCell className="text-sm text-center border-r">
        {project.bidCount}
      </TableCell>

      <TableCell className="flex items-center justify-center gap-2">
        <ProjectUpdateDialog
          project={{
            ...project,
            clientId: user?.id,
          }}
          onUpdate={onUpdate}
          isLoading={isUpdating}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleDeleteProject}
          aria-label="Delete project"
          className="hover:bg-destructive/20 transition-colors cursor-pointer"
          disabled={isDeleting || !authToken}
        >
          {isDeleting ? (
            <Loader2 className="size-4 text-destructive animate-spin" />
          ) : (
            <Trash2 className="size-4 text-destructive" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ProjectRowWithUpdate;
