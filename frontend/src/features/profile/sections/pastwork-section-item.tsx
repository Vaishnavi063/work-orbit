import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import type { PastWork } from "@/types";

interface PastWorkItemProps {
  work: PastWork;
  onEdit: () => void;
  onDelete: () => void;
}

const PastWorkItem: React.FC<PastWorkItemProps> = ({ work, onEdit, onDelete }) => {
  return (
    <Card className="border border-gray-200 hover:border-purple-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <h4 className="font-semibold text-gray-900 text-lg">
              {work.title}
            </h4>
            
            {/* Link */}
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <a
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
              >
                {work.link}
              </a>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {work.description}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PastWorkItem;