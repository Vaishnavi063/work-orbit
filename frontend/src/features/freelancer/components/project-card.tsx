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
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  CLOSED: {
    className: "bg-gray-50 text-gray-600 border-gray-200",
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
    <Card className="w-full max-w-sm flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardHeader className="p-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">
            {project.title}
          </CardTitle>
          <Badge
            className={cn(
              "text-xs font-medium px-2.5 py-0.5 rounded-full border",
              statusInfo?.className
            )}
          >
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 font-medium">
            {project.category}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 flex-1 space-y-3">
        {/* Budget Section */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <IndianRupee className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Budget</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            ₹{project.budget.toLocaleString()}
          </span>
        </div>

        {/* Deadline Section */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Deadline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-900">
              {formatDate(project.deadline)}
            </span>
            {daysLeft > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-medium border",
                  isUrgent
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                )}
              >
                <Timer className="h-2.5 w-2.5 mr-0.5" />
                {daysLeft}d
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 mt-auto">
        <Button
          className="w-full h-9 font-semibold cursor-pointer text-xs bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 group rounded-lg"
          onClick={handleViewAndBid}
          aria-label="View and bid on project"
        >
          <span>View & Bid</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
