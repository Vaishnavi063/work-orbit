import { Calendar, Tag, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProjectDetailsSkeleton from "@/components/shared/project-details-skeleton";
import InfoCard from "./info-card";
import useGetBids from "../hooks/use-get-bids";
import useGetProjectDetails from "../hooks/use-get-project-details";
import BidList from "./bid-list";
import SubmitProposal from "./submit-proposal";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { project, error, isLoading } = useGetProjectDetails();
  const { bids, isLoading: bidIsLoading, refetch } = useGetBids();

  if (isLoading) return <ProjectDetailsSkeleton />;

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-red-600">
            Failed to load project details.
          </h2>
          <p className="mt-2 text-slate-500">
            Please try refreshing the page or check the project ID.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(project.deadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen sm:p-3 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md">
          <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {project.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Posted by Client #{project.clientId}
              </p>
            </div>
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                project.status === "OPEN"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {project.status}
            </span>
          </header>

          <div className="my-4 border-t border-slate-200"></div>

          <main className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-slate-800">
                Project Description
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {project.description}
              </p>

              {project.status === "OPEN" && (
                <div className="mt-6">
                  <SubmitProposal
                    projectId={project.id}
                    refetchBids={refetch}
                  />
                </div>
              )}
            </div>

            <aside className="space-y-4 md:col-span-1">
              <InfoCard
                icon={<IndianRupee className="h-6 w-6 text-emerald-600" />}
                label="Budget"
                value={`₹${project.budget.toLocaleString()}`}
                className="bg-emerald-50/50"
              />
              <InfoCard
                icon={<Calendar className="h-6 w-6 text-amber-600" />}
                label="Deadline"
                value={formattedDate}
                className="bg-amber-50/50"
              />
              <InfoCard
                icon={<Tag className="h-6 w-6 text-indigo-600" />}
                label="Category"
                value={project.category}
                className="bg-indigo-50/50"
              />
            </aside>
          </main>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-7xl rounded-lg">
        {bidIsLoading ? (
          <div className="text-center text-slate-400 italic">
            Loading bids...
          </div>
        ) : Array.isArray(bids) && bids.length > 0 ? (
          <BidList bids={bids} />
        ) : (
          <div className="text-center text-slate-400 italic">
            No bids submitted yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
