import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { ProfileData } from "@/types";

interface SkillsSectionProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ profile, setProfile }) => {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => prev ? {
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      } : null);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => prev ? {
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    } : null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Skills */}
      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border border-gray-200 rounded-lg bg-gray-50">
        {profile.skills.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 flex items-center gap-2"
          >
            {skill}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSkill(skill)}
              className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {profile.skills.length === 0 && (
          <span className="text-gray-400 text-sm">No skills added yet</span>
        )}
      </div>

      {/* Add New Skill */}
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new skill"
          className="flex-1 border-gray-300 focus:border-green-500"
        />
        <Button
          type="button"
          onClick={handleAddSkill}
          className="bg-green-600 hover:bg-green-700 text-white px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default SkillsSection;