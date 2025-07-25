import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PencilIcon } from "lucide-react";
import type { Project } from "./project-table";
import { ProjectUpdateForm } from "./project-update-form";

interface Props {
  project: Project;
  onUpdate: (projectId: string, data: ProjectUpdateData) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

export interface ProjectUpdateData {
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  clientId: number;
}

export const ProjectUpdateDialog = ({
  project,
  onUpdate,
  isLoading,
  trigger,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: ProjectUpdateData) => {
    onUpdate(project.id.toString(), data);
    setOpen(false);
  };

  const defaultTrigger = (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Edit project"
      className="hover:bg-accent/50 cursor-pointer transition-colors"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="size-4 text-green-600 animate-spin" />
      ) : (
        <PencilIcon className="size-4 text-green-600" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Project</DialogTitle>
          <DialogDescription>
            Make changes to your project details below.
          </DialogDescription>
        </DialogHeader>

        <ProjectUpdateForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
