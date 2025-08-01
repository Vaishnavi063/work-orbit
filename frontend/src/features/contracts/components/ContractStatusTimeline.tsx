import React from "react";
import { format } from "date-fns";
import { CheckCircle, Clock } from "lucide-react";
import { ContractStatus } from "@/features/contracts/types";

/**
 * Interface for status history entry
 */
interface StatusHistoryEntry {
  status: ContractStatus;
  timestamp: string;
}

/**
 * Props for ContractStatusTimeline component
 */
interface ContractStatusTimelineProps {
  statusHistory?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  currentStatus: ContractStatus;
}

/**
 * Component for displaying contract status history timeline
 */
const ContractStatusTimeline: React.FC<ContractStatusTimelineProps> = ({
  statusHistory,
  createdAt,
  updatedAt,
  currentStatus,
}) => {
  // If no status history is provided, create a basic timeline based on available data
  const timeline = statusHistory || [
    {
      status: ContractStatus.IN_PROGRESS,
      timestamp: createdAt,
    },
    // Only add completed status if the contract is completed
    ...(currentStatus === ContractStatus.COMPLETED
      ? [
          {
            status: ContractStatus.COMPLETED,
            timestamp: updatedAt,
          },
        ]
      : []),
  ];

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy, h:mm a");
  };

  return (
    <div className="contract-status-timeline mt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Status History</h3>
      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <div key={index} className="flex items-start">
            <div className="mr-3 mt-0.5">
              {entry.status === ContractStatus.COMPLETED ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {entry.status === ContractStatus.IN_PROGRESS
                  ? "Contract Created"
                  : "Contract Completed"}
              </p>
              <p className="text-sm text-gray-500">{formatDate(entry.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractStatusTimeline;