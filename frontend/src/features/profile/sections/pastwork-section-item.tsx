import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink, Calendar, Clock } from "lucide-react";
import type { PastWork } from "@/types";
import { getTimelineInfo } from "@/lib/utils";

interface PastWorkItemProps {
  work: PastWork;
  onEdit: () => void;
  onDelete: () => void;
}

const PastWorkItem: React.FC<PastWorkItemProps> = ({ work, onEdit, onDelete }) => {
  const timeline = getTimelineInfo(work.startDate, work.endDate);
  
  return (
    <Card className="border border-gray-200 hover:border-purple-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            {/* Title and Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-lg">
                {work.title}
              </h4>
              {timeline.isOngoing && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Ongoing
                </Badge>
              )}
            </div>
            
            {/* Timeline Information - Prominently displayed */}
            {timeline.formattedRange && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-gray-800">{timeline.formattedRange}</span>
                {timeline.duration && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-medium">{timeline.duration}</span>
                  </>
                )}
              </div>
            )}
            
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