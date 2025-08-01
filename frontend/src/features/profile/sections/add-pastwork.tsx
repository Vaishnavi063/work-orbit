import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { cn, formatDate, isValidDateRange } from "@/lib/utils";
import type { ProfileData } from "@/types";

interface AddPastWorkFormProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  onCancel: () => void;
}

const AddPastWorkForm: React.FC<AddPastWorkFormProps> = ({
  setProfile,
  onCancel,
}) => {
  const [newPastWork, setNewPastWork] = useState({
    title: "",
    link: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");

  const handleAddPastWork = () => {
    // Validate required fields
    if (!newPastWork.title || !newPastWork.link || !newPastWork.description) {
      return;
    }

    // Validate date range if both dates are provided
    if (!isValidDateRange(newPastWork.startDate, newPastWork.endDate)) {
      setDateValidationError("End date cannot be before start date");
      return;
    }

    // Clear any previous validation errors
    setDateValidationError("");

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            pastWorks: [
              ...prev.pastWorks,
              {
                id: Date.now(), // Temporary ID for new items
                title: newPastWork.title,
                link: newPastWork.link,
                description: newPastWork.description,
                startDate: newPastWork.startDate || undefined,
                endDate: newPastWork.endDate || undefined,
              },
            ],
          }
        : null
    );

    setNewPastWork({
      title: "",
      link: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setDateValidationError("");
    onCancel();
  };

  const isFormValid =
    newPastWork.title &&
    newPastWork.link &&
    newPastWork.description &&
    !dateValidationError;

  // Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    const dateString = date ? date.toISOString().split("T")[0] : "";
    setNewPastWork({ ...newPastWork, startDate: dateString });
    setStartDateOpen(false);

    // Clear validation error when dates change
    if (dateValidationError) {
      setDateValidationError("");
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    const dateString = date ? date.toISOString().split("T")[0] : "";
    setNewPastWork({ ...newPastWork, endDate: dateString });
    setEndDateOpen(false);

    // Clear validation error when dates change
    if (dateValidationError) {
      setDateValidationError("");
    }
  };

  return (
    <Card className="border-2 border-dashed border-purple-300 bg-purple-50/30">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-800">Add New Past Work</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Project Title *
            </Label>
            <Input
              id="title"
              value={newPastWork.title}
              onChange={(e) =>
                setNewPastWork({ ...newPastWork, title: e.target.value })
              }
              placeholder="Enter project title"
              className="border-gray-300 focus:border-purple-500"
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">
              Project Link *
            </Label>
            <Input
              id="link"
              type="url"
              value={newPastWork.link}
              onChange={(e) =>
                setNewPastWork({ ...newPastWork, link: e.target.value })
              }
              placeholder="https://example.com"
              className="border-gray-300 focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={newPastWork.description}
              onChange={(e) =>
                setNewPastWork({ ...newPastWork, description: e.target.value })
              }
              placeholder="Describe your project, technologies used, and your role..."
              className="border-gray-300 focus:border-purple-500 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Timeline Section */}
          <div className="space-y-4 pt-2 border-t border-gray-200">
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
                        !newPastWork.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newPastWork.startDate
                        ? formatDate(newPastWork.startDate)
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newPastWork.startDate
                          ? new Date(newPastWork.startDate)
                          : undefined
                      }
                      onSelect={handleStartDateSelect}
                      disabled={(date) => date > new Date()}
                      initialFocus
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
                        !newPastWork.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newPastWork.endDate
                        ? formatDate(newPastWork.endDate)
                        : "Select end date (leave empty if ongoing)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newPastWork.endDate
                          ? new Date(newPastWork.endDate)
                          : undefined
                      }
                      onSelect={handleEndDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        const startDate = newPastWork.startDate
                          ? new Date(newPastWork.startDate)
                          : null;
                        return date > today || (startDate && date < startDate);
                      }}
                      initialFocus
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

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddPastWork}
              disabled={!isFormValid}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Work
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddPastWorkForm;
