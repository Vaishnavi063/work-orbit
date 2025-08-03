import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, IndianRupee, Tag, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  budget: number;
  status: string;
  deadline: string;
};

const statusConfig = {
  OPEN: {
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  CLOSED: {
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const ProjectCard = ({ project }: { project: Project }) => {
  const navigate = useNavigate();

  const handleViewAndBid = () => {
    navigate(`/dashboard/browse-projects/${project.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(project.deadline);
  const isUrgent = daysLeft <= 3 && daysLeft > 0;
  const statusInfo = statusConfig[project.status as keyof typeof statusConfig];

  return (
    <Card className="w-full max-w-sm flex flex-col border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {project.title}
          </CardTitle>
          <Badge
            className={cn(
              "text-xs font-semibold px-3 py-0.5 rounded-full border shadow-sm",
              statusInfo?.className
            )}
          >
            {project.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="h-4 w-4 text-gray-400" />
          {project.category}
        </div>
      </CardHeader>

      <CardContent className="px-5 flex-1 space-y-4">
        {/* Budget Section */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-md border border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-md shadow">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-800">Budget</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            ₹{project.budget.toLocaleString()}
          </span>
        </div>

        {/* Deadline Section */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-md shadow">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-800">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {formatDate(project.deadline)}
            </span>
            {daysLeft > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium border",
                  isUrgent
                    ? "bg-orange-100 text-orange-700 border-orange-300 animate-pulse"
                    : "bg-blue-100 text-blue-700 border-blue-300"
                )}
              >
                <Timer className="h-3 w-3 mr-1" />
                {daysLeft}d
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 mt-auto">
        <Button
          className="w-full h-10 font-medium text-sm bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white group rounded-lg shadow-sm"
          onClick={handleViewAndBid}
          aria-label="View and bid on project"
        >
          <span>View & Bid</span>
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
