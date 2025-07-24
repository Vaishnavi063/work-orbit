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
import { Save, X } from "lucide-react";
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

  useEffect(() => {
    setEditedWork(work);
  }, [work]);

  const handleSave = () => {
    if (editedWork.title && editedWork.link && editedWork.description) {
      onSave(editedWork);
    }
  };

  const isFormValid = editedWork.title && editedWork.link && editedWork.description;

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