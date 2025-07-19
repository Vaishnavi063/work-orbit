import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";

const Profile = () => {
  const { user } = useAuth();

  const getInitial = (name: string | undefined) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="relative w-screen max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-muted border rounded-xl shadow-md p-4 sm:p-8 md:p-10">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <p className="text-muted-foreground font-medium">Role</p>
                <p
                  className={`font-semibold ${
                    user?.role === "ROLE_FREELANCER"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {user?.role === "ROLE_FREELANCER" ? "Freelancer" : "Client"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Email Address
                </p>
                <p className="text-foreground font-medium break-words">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
