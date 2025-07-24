import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileData } from "@/types";
import BasicInfoSection from "../sections/basic-info";
import SkillsSection from "../sections/skill-section";
import PastWorkSection from "../sections/pastwork-section";


interface ProfileFormProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  deletedPastWorkIds: number[];
  setDeletedPastWorkIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  setProfile,
  deletedPastWorkIds,
  setDeletedPastWorkIds
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="border border-blue-200 bg-white/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            👤 Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BasicInfoSection profile={profile} setProfile={setProfile} />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border border-green-200 bg-white/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            🛠️ Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsSection profile={profile} setProfile={setProfile} />
        </CardContent>
      </Card>

      {/* Past Work */}
      <Card className="border border-purple-200 bg-white/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
            💼 Past Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PastWorkSection
            profile={profile}
            setProfile={setProfile}
            deletedPastWorkIds={deletedPastWorkIds}
            setDeletedPastWorkIds={setDeletedPastWorkIds}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;