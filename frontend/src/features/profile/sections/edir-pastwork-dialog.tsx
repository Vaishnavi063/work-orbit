import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";
import { cn, formatDate, isValidDateRange } from "@/lib/utils";
import type { PastWork } from "@/types";

interface EditPastWorkDialogProps {
  work: PastWork;
  onSave: (updatedWork: PastWork) => void;
  onCancel: () => void;
}

const EditPastWorkDialog: React.FC<EditPastWorkDialogProps> = ({
  work,
  onSave,
  onCancel
}) => {
  const [editedWork, setEditedWork] = useState<PastWork>(work);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");

  useEffect(() => {
    setEditedWork(work);
    setDateValidationError(""); // Clear validation errors when work changes
  }, [work]);

  const handleSave = () => {
    // Validate required fields
    if (!editedWork.title || !editedWork.link || !editedWork.description) {
      return;
    }

    // Validate date range if both dates are provided
    if (!isValidDateRange(editedWork.startDate, editedWork.endDate)) {
      setDateValidationError("End date cannot be before start date");
      return;
    }

    // Clear any previous validation errors
    setDateValidationError("");
    onSave(editedWork);
  };

  // Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    const dateString = date ? date.toISOString().split("T")[0] : undefined;
    setEditedWork({ ...editedWork, startDate: dateString });
    setStartDateOpen(false);

    // Clear validation error when dates change
    if (dateValidationError) {
      setDateValidationError("");
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    const dateString = date ? date.toISOString().split("T")[0] : undefined;
    setEditedWork({ ...editedWork, endDate: dateString });
    setEndDateOpen(false);

    // Clear validation error when dates change
    if (dateValidationError) {
      setDateValidationError("");
    }
  };

  const isFormValid = 
    editedWork.title && 
    editedWork.link && 
    editedWork.description && 
    !dateValidationError;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            ✏️ Edit Past Work
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Project Title *
            </Label>
            <Input
              id="edit-title"
              value={editedWork.title}
              onChange={(e) => setEditedWork({ ...editedWork, title: e.target.value })}
              placeholder="Enter project title"
              className="border-gray-300 focus:border-purple-500"
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="edit-link" className="text-sm font-medium">
              Project Link *
            </Label>
            <Input
              id="edit-link"
              type="url"
              value={editedWork.link}
              onChange={(e) => setEditedWork({ ...editedWork, link: e.target.value })}
              placeholder="https://example.com"
              className="border-gray-300 focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="edit-description"
              value={editedWork.description}
              onChange={(e) => setEditedWork({ ...editedWork, description: e.target.value })}
              placeholder="Describe your project, technologies used, and your role..."
              className="border-gray-300 focus:border-purple-500 min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Timeline Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700">
              Project Timeline (Optional)
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 focus:border-purple-500",
                        !editedWork.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedWork.startDate
                        ? formatDate(editedWork.startDate)
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editedWork.startDate
                          ? new Date(editedWork.startDate)
                          : undefined
                      }
                      onSelect={handleStartDateSelect}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 focus:border-purple-500",
                        !editedWork.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedWork.endDate
                        ? formatDate(editedWork.endDate)
                        : "Select end date (leave empty if ongoing)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editedWork.endDate
                          ? new Date(editedWork.endDate)
                          : undefined
                      }
                      onSelect={handleEndDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        const startDate = editedWork.startDate
                          ? new Date(editedWork.startDate)
                          : null;
                        return date > today || (startDate ? date < startDate : false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Date Validation Error */}
            {dateValidationError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {dateValidationError}
              </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-gray-500">
              Leave end date empty for ongoing projects. Start date cannot be in
              the future.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPastWorkDialog;