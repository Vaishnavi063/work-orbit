import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import type { ProfileData } from "@/types";

interface AddPastWorkFormProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  onCancel: () => void;
}

const AddPastWorkForm: React.FC<AddPastWorkFormProps> = ({
  setProfile,
  onCancel
}) => {
  const [newPastWork, setNewPastWork] = useState({
    title: "",
    link: "",
    description: ""
  });

  const handleAddPastWork = () => {
    if (newPastWork.title && newPastWork.link && newPastWork.description) {
      setProfile(prev => prev ? {
        ...prev,
        pastWorks: [
          ...prev.pastWorks,
          {
            id: Date.now(), // Temporary ID for new items
            title: newPastWork.title,
            link: newPastWork.link,
            description: newPastWork.description
          }
        ]
      } : null);
      
      setNewPastWork({ title: "", link: "", description: "" });
      onCancel();
    }
  };

  const isFormValid = newPastWork.title && newPastWork.link && newPastWork.description;

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
              onChange={(e) => setNewPastWork({ ...newPastWork, title: e.target.value })}
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
              onChange={(e) => setNewPastWork({ ...newPastWork, link: e.target.value })}
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
              onChange={(e) => setNewPastWork({ ...newPastWork, description: e.target.value })}
              placeholder="Describe your project, technologies used, and your role..."
              className="border-gray-300 focus:border-purple-500 min-h-[80px]"
              rows={3}
            />
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