import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { ProfileData } from "@/types";

interface BasicInfoSectionProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ profile, setProfile }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => prev ? { ...prev, name: e.target.value } : null);
  };

  const handleRatingChange = (delta: number) => {
    setProfile(prev => prev ? {
      ...prev,
      rating: Math.max(0, Math.min(5, +(prev.rating + delta).toFixed(1)))
    } : null);
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name
        </Label>
        <Input
          id="name"
          value={profile.name}
          onChange={handleNameChange}
          className="bg-white border-gray-300 focus:border-blue-500"
          placeholder="Enter your full name"
        />
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <Input
          id="email"
          value={profile.email}
          readOnly
          className="bg-gray-50 border-gray-200 text-gray-600"
        />
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Rating
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRatingChange(-0.1)}
            className="h-8 w-8 p-0 border-gray-300"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            value={profile.rating}
            readOnly
            className="w-20 text-center bg-gray-50 border-gray-200"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRatingChange(0.1)}
            className="h-8 w-8 p-0 border-gray-300"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">/ 5.0</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;