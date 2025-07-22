import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";
import useGetFreelancerProfile from "@/features/freelancer/hooks/use-get-freelancer-profile";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only fetch freelancer details if user is a freelancer
  const { data: freelancerData, isLoading: freelancerLoading, error: freelancerError } =
    user?.role === "ROLE_FREELANCER" && user?.id && user?.token
      ? useGetFreelancerProfile(user.id.toString(), user.token)
      : { data: null, isLoading: false, error: null };

  const getInitial = (name: string | undefined) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="relative w-screen max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-muted border rounded-xl shadow-md p-4 sm:p-8 md:p-10 relative">
        {/* Update Profile button at top right */}
        <button
          className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/dashboard/profile/update")}
        >
          Update Profile
        </button>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-primary">
            <AvatarImage src="https://github.com/shadcn.png" alt="profile" />
            <AvatarFallback className="text-2xl sm:text-3xl font-semibold text-card bg-foreground flex items-center justify-center w-full h-full">
              {getInitial(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-4 w-full text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary break-words">
              {user?.name}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 text-sm sm:text-base">
              {/* Freelancer-specific details in unified containers with label above */}
              <div>
                <p className="text-muted-foreground font-medium">Role</p>
                <div className="border border-gray-300 rounded p-2 mt-2 bg-gray-100 flex items-center">
                  <p className={`font-semibold ${user?.role === "ROLE_FREELANCER" ? "text-green-600" : "text-blue-600"}`}>{user?.role === "ROLE_FREELANCER" ? "Freelancer" : "Client"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Email Address</p>
                <div className="border border-gray-300 rounded p-2 mt-2 bg-gray-100 flex items-center">
                  <p className="text-foreground font-medium break-words">{user?.email}</p>
                </div>
              </div>
              {user?.role === "ROLE_FREELANCER" && (
                <>
                  <div>
                    <p className="text-muted-foreground font-medium">Rating</p>
                    <div className="border border-gray-300 rounded p-2 mt-2 bg-gray-100 flex items-center">
                      <p className="text-foreground font-medium break-words">
                        {freelancerLoading && "Loading..."}
                        {freelancerError && "Failed to load rating"}
                        {freelancerData && freelancerData.rating !== undefined ? freelancerData.rating + " / 5" : null}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Skills</p>
                    {freelancerLoading && <p className="text-foreground font-medium break-words">Loading...</p>}
                    {freelancerError && <p className="text-foreground font-medium break-words">Failed to load skills</p>}
                    {freelancerData && Array.isArray(freelancerData.skills) && freelancerData.skills.length > 0 ? (
                      <div className="border border-gray-300 rounded p-2 mt-2 mb-1 flex flex-wrap gap-2 bg-gray-100">
                        {freelancerData.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-4 py-1 border border-gray-300 rounded-full text-sm text-gray-800 bg-gray-100 flex items-center justify-center min-w-[80px] text-center"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Past Work</p>
                    {freelancerLoading && <p className="text-foreground font-medium break-words mt-2">Loading...</p>}
                    {freelancerError && <p className="text-foreground font-medium break-words mt-2">Failed to load past work</p>}
                    {freelancerData && Array.isArray(freelancerData.pastWorks) && freelancerData.pastWorks.length > 0 ? (
                      <ul className="space-y-2 mt-2">
                        {freelancerData.pastWorks.map((work: any) => (
                          <li key={work.id} className="border rounded p-2">
                            <div className="font-bold">{work.title}</div>
                            <a href={work.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              {work.link}
                            </a>
                            <div className="text-gray-700">{work.description}</div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
