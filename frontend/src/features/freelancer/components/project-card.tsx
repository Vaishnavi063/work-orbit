import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Calendar, Tag, ArrowRight, Clock, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  budget: number;
  status: string;
  deadline: string;
};

const statusColors: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const navigate = useNavigate();
  const isClosed = project.status === "CLOSED";

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

  return (
    <Card className="group w-full max-w-sm flex flex-col bg-white border border-neutral-500/20 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-5 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-neutral-900 leading-tight line-clamp-2 flex-1">
            {project.title}
          </CardTitle>
          <Badge
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
              statusColors[project.status] ||
              "bg-neutral-100 text-neutral-600 border-neutral-200"
            }`}
          >
            {project.status}
          </Badge>
        </div>

        <Badge
          variant="secondary"
          className="w-fit text-xs font-medium px-2.5 py-1 bg-neutral-100 text-neutral-700 border-neutral-200 rounded-full"
        >
          <Tag className="h-3 w-3 mr-1.5 text-neutral-500" />
          {project.category}
        </Badge>
      </CardHeader>

      <CardContent className="px-5 flex-1 space-y-3">
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-neutral-600">Budget</span>
          </div>
          <span className="text-lg font-bold text-neutral-900">
            ₹{project.budget.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isUrgent ? "bg-amber-500/10" : "bg-blue-500/10"
              }`}
            >
              <Calendar
                className={`h-4 w-4 ${
                  isUrgent ? "text-amber-600" : "text-blue-600"
                }`}
              />
            </div>
            <span className="text-sm text-neutral-600">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {formatDate(project.deadline)}
            </span>
            {daysLeft > 0 && (
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isUrgent
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {daysLeft}d
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-4 mt-auto">
        {isClosed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled
                className="w-full h-11 font-medium text-sm bg-neutral-50 text-neutral-500 border-neutral-200 cursor-not-allowed rounded-xl"
                aria-label="Bidding closed"
              >
                <Clock className="h-4 w-4 mr-2" />
                Bidding Closed
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              This project is closed for bidding.
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            className="w-full cursor-pointer h-11 font-semibold text-sm bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-200 group/btn rounded-xl shadow-sm hover:shadow"
            onClick={handleViewAndBid}
            aria-label="View and bid on project"
          >
            View & Bid
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
