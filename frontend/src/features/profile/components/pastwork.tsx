import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Briefcase, Calendar, Clock } from "lucide-react";
import { getTimelineInfo } from "@/lib/utils";

interface PastWork {
  id: number;
  title: string;
  link: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

interface PastWorksListProps {
  pastWorks?: PastWork[];
}

export const PastWorksList = ({ pastWorks }: PastWorksListProps) => {
  if (!pastWorks || pastWorks.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <div className="text-slate-500 text-sm">No past work to display</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {pastWorks.map((work) => {
        const timeline = getTimelineInfo(work.startDate, work.endDate);
        const hasTimeline = work.startDate || work.endDate;

        return (
          <Card
            key={work.id.toString()}
            className="border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {work.title}
                  </CardTitle>

                  {/* Timeline Information */}
                  {hasTimeline && (
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Date Range Badge */}
                      {timeline.formattedRange && (
                        <Badge
                          variant="outline"
                          className="text-slate-600 border-slate-300 bg-slate-50"
                        >
                          <Calendar className="w-3 h-3" />
                          {timeline.formattedRange}
                        </Badge>
                      )}

                      {/* Duration Badge */}
                      {timeline.duration && (
                        <Badge
                          variant="outline"
                          className="text-slate-600 border-slate-300 bg-slate-50"
                        >
                          <Clock className="w-3 h-3" />
                          {timeline.duration}
                        </Badge>
                      )}

                      {/* Ongoing Indicator */}
                      {timeline.isOngoing && (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                        >
                          Ongoing
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full flex-shrink-0"
                  aria-label={`View ${work.title} project`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col h-full">
              <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                {work.description}
              </p>

              <a
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors group mt-auto"
              >
                View Project
                <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
