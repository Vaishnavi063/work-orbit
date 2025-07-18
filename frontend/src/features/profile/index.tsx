import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="relative">
      <div className="p-4 mb-4 sm:p-8 border rounded-lg shadow-sm w-full bg-muted">
        <div className="flex items-center sm:space-x-10 flex-col sm:flex-row">
          <Avatar className="bg-primary size-48">
            <AvatarImage src={"https://github.com/shadcn.png"} alt="profile" />
            <AvatarFallback className="flex bg-foreground items-center justify-center w-full sm:text-4xl h-full text-card">
              {user?.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-6">
            <h1 className="text-primary font-medium text-base sm:text-xl lg:text-3xl">
              {user?.name}
            </h1>
            <div className="flex sm:items-center sm:space-x-8 flex-col space-y-4 sm:space-y-0 sm:flex-row">
              <div className="flex flex-col">
                <h1 className="text-primary font-medium text-sm">Role</h1>
                <h1 className="text-sm">
                  {user?.role === "ROLE_FREELANCER" ? (
                    <span>Freelancer</span>
                  ) : (
                    <span>Client</span>
                  )}
                </h1>
              </div>
              <div className="flex flex-col">
                <h1 className="text-primary font-medium text-sm">
                  Email Adress
                </h1>
                <h1 className="text-sm">{user?.email}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
