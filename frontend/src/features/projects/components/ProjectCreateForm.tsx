import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import { useErrorHandler } from "@/hooks/use-error-handler";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  projectCreateFormSchema,
  type ProjectCreateFormValues,
} from "../types";
import {
  createProject,
  selectProjectsLoading,
  selectProjectsError,
} from "@/store/slices/projects-slice";
import type { RootState, AppDispatch } from "@/store";
import { CATEGORIES } from "@/constants/categories";

interface ProjectCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, authToken } = useSelector((state: RootState) => state.auth);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const { handleError, handleSuccess } = useErrorHandler();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<ProjectCreateFormValues>({
    resolver: zodResolver(projectCreateFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      category: "",
      deadline: undefined,
    },
  });

  const onSubmit = async (data: ProjectCreateFormValues) => {
    if (!user?.id || !authToken) {
      handleError("Authentication required", {
        toastTitle: "Authentication Error",
        showToast: true
      });
      return;
    }

    try {
      const projectData = {
        title: data.title,
        description: data.description,
        budget: data.budget,
        category: data.category,
        deadline: data.deadline.toISOString(),
        clientId: user.id,
      };

      const result = await dispatch(
        createProject({ data: projectData, authToken })
      );

      if (createProject.fulfilled.match(result)) {
        handleSuccess("Project created successfully!");
        form.reset();
        onClose();
        onSuccess?.();
      } else {
        handleError(error.createProject || "Failed to create project", {
          toastTitle: "Creation Failed",
          showToast: true
        });
      }
    } catch (err) {
      handleError(err as Error, {
        toastTitle: "Failed to create project",
        showToast: true
      });
    }
  };

  const handleClose = () => {
    try {
      form.reset();
      onClose();
    } catch (err) {
      handleError(err as Error, {
        toastTitle: "Error closing form",
        showToast: true
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Project</DialogTitle>
          <DialogDescription>
            Create a new project to receive bids from freelancers. Fill in all the details to attract the right talent.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project requirements, goals, and any specific details..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (USD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.title}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deadline Field */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Deadline *</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a deadline</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading.createProject}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading.createProject}>
                {loading.createProject ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateForm;