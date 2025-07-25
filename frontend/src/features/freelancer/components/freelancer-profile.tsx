import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileField } from "@/features/profile/components/profile-field";
import { SkillsList } from "@/features/profile/components/skill-list";
import { PastWorksList } from "@/features/profile/components/pastwork";
import {
    LoadingState,
    ErrorState,
} from "@/features/profile/components/loading-error-state";
import useGetFreelancerProfile from "@/features/freelancer/hooks/use-get-freelancer-profile";

interface FreelancerProfileProps {
    freelancerId: string;
    authToken: string;
}

const FreelancerProfile: React.FC<FreelancerProfileProps> = ({
    freelancerId,
    authToken,
}) => {
    const {
        data: freelancerData,
        isLoading: freelancerLoading,
        error: freelancerError,
    } = useGetFreelancerProfile(freelancerId, authToken);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Freelancer Profile
                    </h1>
                    <p className="text-slate-600">
                        View freelancer's profile information and portfolio
                    </p>
                </div>

                {/* Profile Header Card */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
                    <CardContent className="p-8 relative">
                        <ProfileHeader
                            user={{
                                name: freelancerData?.name,
                                email: freelancerData?.email,
                                role: "ROLE_FREELANCER",
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Main Content - Equal Width Containers */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center mb-5">
                                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Basic Information
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ProfileField
                                    label="Role"
                                    value="Freelancer"
                                    variant="success"
                                />
                                <ProfileField
                                    label="Email Address"
                                    value={freelancerData?.email}
                                    isLoading={freelancerLoading}
                                    error={freelancerError}
                                />
                                <ProfileField
                                    label="Rating"
                                    isLoading={freelancerLoading}
                                    error={freelancerError}
                                    value={
                                        freelancerData?.rating
                                            ? `${freelancerData.rating} / 5`
                                            : undefined
                                    }
                                    variant="rating"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Container */}
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

                    {/* Past Work Container */}
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
                                <PastWorksList
                                    pastWorks={freelancerData?.pastWorks}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FreelancerProfile;
