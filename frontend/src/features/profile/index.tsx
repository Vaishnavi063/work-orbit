
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import useAuth from "@/hooks/use-auth";
import useGetFreelancerProfile from "@/features/freelancer/hooks/use-get-freelancer-profile";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "./components/profile-header";
import { ProfileField } from "./components/profile-field";
import { ErrorState, LoadingState } from "./components/loading-error-state";
import { SkillsList } from "./components/skill-list";
import { PastWorksList } from "./components/pastwork";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shouldFetchFreelancerData =
    user?.role === "ROLE_FREELANCER" && user?.id && user?.token;

  const {
    data: freelancerData,
    isLoading: freelancerLoading,
    error: freelancerError
  } = shouldFetchFreelancerData
      ? useGetFreelancerProfile(String(user?.id), user.token)
      : { data: null, isLoading: false, error: null };

  const isFreelancer = user?.role === "ROLE_FREELANCER";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
          <p className="text-slate-600">Manage your profile information and settings</p>
        </div>

        {/* Profile Header Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-8 relative">
            {isFreelancer && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-6 right-6 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                onClick={() => navigate("/dashboard/profile/update")}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <ProfileHeader user={user} />
          </CardContent>
        </Card>

        {/* Main Content - Equal Width Containers */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center mb-5">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProfileField
                  label="Role"
                  value={isFreelancer ? "Freelancer" : "Client"}
                  variant={isFreelancer ? "success" : "primary"}
                />
                <ProfileField
                  label="Email Address"
                  value={user?.email}
                />
                {isFreelancer && (
                  <ProfileField
                    label="Rating"
                    isLoading={freelancerLoading}
                    error={freelancerError}
                    value={freelancerData?.rating ? `${freelancerData.rating} / 5` : undefined}
                    variant="rating"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Container - Only for Freelancers */}
          {isFreelancer && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                  Skills & Expertise
                </h2>
                {freelancerLoading ? (
                  <LoadingState />
                ) : freelancerError ? (
                  <ErrorState message="Failed to load skills" />
                ) : (
                  <SkillsList skills={freelancerData?.skills} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Past Work Container - Only for Freelancers */}
          {isFreelancer && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
                  Portfolio & Past Work
                </h2>
                {freelancerLoading ? (
                  <LoadingState />
                ) : freelancerError ? (
                  <ErrorState message="Failed to load past work" />
                ) : (
                  <PastWorksList pastWorks={freelancerData?.pastWorks} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;