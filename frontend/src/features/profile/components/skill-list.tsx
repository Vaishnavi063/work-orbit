import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

interface SkillsListProps {
  skills?: string[];
}

export const SkillsList = ({ skills }: SkillsListProps) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-12">
        <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <div className="text-slate-500 text-sm">No skills listed yet</div>
      </div>
    );
  }

  const skillColors = [
    "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200",
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill, index) => (
        <Badge 
          key={skill} 
          variant="outline"
          className={`px-4 py-2 text-sm font-medium border transition-all duration-200 hover:shadow-sm cursor-default ${
            skillColors[index % skillColors.length]
          }`}
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
};