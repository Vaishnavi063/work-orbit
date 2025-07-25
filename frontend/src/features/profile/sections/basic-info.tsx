import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileData } from "@/types";

interface BasicInfoSectionProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ profile, setProfile }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => prev ? { ...prev, name: e.target.value } : null);
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

      {/* Rating (Read-only) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Rating
        </Label>
        <Input
          value={profile.rating + " " + "/ 5"}
          readOnly
          className="w-20 text-center bg-gray-50 border-gray-200 text-gray-600"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;