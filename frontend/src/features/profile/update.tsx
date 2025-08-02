import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/use-auth";
import useGetFreelancerProfile from "@/features/freelancer/hooks/use-get-freelancer-profile";
import apis from "@/features/freelancer/apis";
import ProfileForm from "./components/profile-form";
import type { ProfileData } from "@/types";
import { handleTimelineApiError } from "@/utils/timeline-api-utils";

const ProfileUpdate = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletedPastWorkIds, setDeletedPastWorkIds] = useState<number[]>([]);

  if (!user || !user.id || !user.token) {
    return (
      <div className="flex items-center justify-center py-20">
        <Alert className="max-w-md">
          <AlertDescription>
            User not found or not authenticated.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    data: freelancerData,
    isLoading,
    error,
  } = useGetFreelancerProfile(user.id.toString(), user.token);

  useEffect(() => {
    if (freelancerData) setProfile(freelancerData);
  }, [freelancerData]);

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Failed to load profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    // Validation
    if (!profile.name?.trim()) {
      setSaveError("Name is required.");
      return;
    }
    if (profile.rating < 0 || profile.rating > 5) {
      setSaveError("Rating must be between 0 and 5.");
      return;
    }
    if (!profile.skills?.length) {
      setSaveError("At least one skill is required.");
      return;
    }

    setSaveLoading(true);
    try {
      const pastWorksPayload = preparePastWorksPayload();

      await apis.updateFreelancerProfile({
        authToken: user.token,
        id: user.id!,
        data: {
          name: profile.name,
          rating: profile.rating,
          skills: profile.skills,
          pastWorks: pastWorksPayload,
        },
      });

      setSaveSuccess(true);
      setDeletedPastWorkIds([]);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      // Use the timeline API error handler for better error messages
      setSaveError(handleTimelineApiError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const preparePastWorksPayload = () => {
    const isRealBackendId = (id: any) => typeof id === "number" && id < 1e6;

    const updatedExisting = profile.pastWorks
      .filter(
        (w: any) => isRealBackendId(w.id) && !deletedPastWorkIds.includes(w.id)
      )
      .map((w: any) => ({
        id: w.id,
        title: w.title,
        link: w.link,
        description: w.description,
        startDate: w.startDate || null,
        endDate: w.endDate || null,
      }));

    const newWorks = profile.pastWorks
      .filter((w: any) => !isRealBackendId(w.id))
      .map((w: any) => ({
        title: w.title,
        link: w.link,
        description: w.description,
        startDate: w.startDate || null,
        endDate: w.endDate || null,
      }));

    const deletedWorks = deletedPastWorkIds.map((id) => ({
      id,
      toDelete: true,
      title: "deleted",
      link: "deleted",
      description: "deleted",
      startDate: null,
      endDate: null,
    }));

    return [...updatedExisting, ...newWorks, ...deletedWorks];
  };

  return (
    <Card className="border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          ✏️ Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm
          profile={profile}
          setProfile={setProfile}
          deletedPastWorkIds={deletedPastWorkIds}
          setDeletedPastWorkIds={setDeletedPastWorkIds}
        />

        {/* Status Messages */}
        {saveError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✅ Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={saveLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2 shadow-md"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "💾 Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileUpdate;
