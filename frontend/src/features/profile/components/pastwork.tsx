import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Briefcase } from "lucide-react";

interface PastWork {
  id: number;
  title: string;
  link: string;
  description: string;
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
      {pastWorks.map((work) => (
        <Card 
          key={work.id.toString()}
          className="border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between group">
              <span className="text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {work.title}
              </span>
              <a
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full flex-shrink-0"
                aria-label={`View ${work.title} project`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardTitle>
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
      ))}
    </div>
  );
};