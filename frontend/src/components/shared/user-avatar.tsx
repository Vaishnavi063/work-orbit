import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";

const UserAvatar = () => {
  const { user, isAuth } = useAuth();
  if (!isAuth) return null;
  return (
    <div className="flex items-center justify-center space-x-2">
      <Avatar className="flex items-center justify-center size-6">
        <AvatarImage src={""} alt="profile-picture" />
        <AvatarFallback className="flex bg-foreground items-center text-sm justify-center w-full h-full text-card">
          {user?.name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="ml-2 text-card-foreground text-sm font-medium">
        {user?.name}
      </span>
    </div>
  );
};

export default UserAvatar;
