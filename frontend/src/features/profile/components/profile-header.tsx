import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail } from "lucide-react";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface ProfileHeaderProps {
  user: User | null;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const getInitial = (name: string | undefined) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const isFreelancer = user?.role === "ROLE_FREELANCER";

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
      {/* Fixed Avatar Container - Maintains its position */}
      <div className="relative flex-shrink-0">
        <div className="w-32 h-32 sm:w-36 sm:h-36 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full p-1">
            <div className="bg-white rounded-full p-1 w-full h-full">
              <Avatar className="w-full h-full">
                <AvatarImage 
                  alt={`${user?.name}'s profile`}
                  className="object-cover w-full h-full rounded-full"
                />
                <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white w-full h-full flex items-center justify-center rounded-full">
                  {getInitial(user?.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Container - Positioned to the right */}
      <div className="flex-1 min-w-0 text-center sm:text-left space-y-4 sm:pt-2">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
            {user?.name || "Unknown User"}
          </h1>
          
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm sm:text-base break-all">
              {user?.email || "No email provided"}
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex justify-center sm:justify-start pt-2">
          <Badge 
            variant="outline" 
            className={`px-4 py-2 text-sm font-medium border-2 transition-all duration-200 ${
              isFreelancer 
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300" 
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
            }`}
          >
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            {isFreelancer ? "Freelancer" : "Client"}
          </Badge>
        </div>
      </div>
    </div>
  );
};