import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { PastWork, ProfileData } from "@/types";
import EditPastWorkDialog from "./edir-pastwork-dialog";
import AddPastWorkForm from "./add-pastwork";
import PastWorkItem from "./pastwork-section-item";

interface PastWorkSectionProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  deletedPastWorkIds: number[];
  setDeletedPastWorkIds: React.Dispatch<React.SetStateAction<number[]>>;
}

type SortOrder = "none" | "newest" | "oldest";

const PastWorkSection: React.FC<PastWorkSectionProps> = ({
  profile,
  setProfile,
  setDeletedPastWorkIds,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editWork, setEditWork] = useState<{
    work: PastWork;
    index: number;
  } | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Sorting logic with graceful handling of null dates
  const sortedPastWorks = useMemo(() => {
    if (sortOrder === "none") {
      return profile.pastWorks;
    }

    const sorted = [...profile.pastWorks].sort((a, b) => {
      const aStartDate = a.startDate ? new Date(a.startDate) : null;
      const bStartDate = b.startDate ? new Date(b.startDate) : null;

      // Handle null dates gracefully - put entries without dates at the end
      if (!aStartDate && !bStartDate) return 0;
      if (!aStartDate) return 1;
      if (!bStartDate) return -1;

      const timeDiff = aStartDate.getTime() - bStartDate.getTime();

      return sortOrder === "newest" ? -timeDiff : timeDiff;
    });

    return sorted;
  }, [profile.pastWorks, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder((prev) => {
      switch (prev) {
        case "none":
          return "newest";
        case "newest":
          return "oldest";
        case "oldest":
          return "none";
        default:
          return "none";
      }
    });
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case "newest":
        return <ArrowDown className="h-4 w-4" />;
      case "oldest":
        return <ArrowUp className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case "newest":
        return "Most Recent First";
      case "oldest":
        return "Oldest First";
      default:
        return "Sort by Date";
    }
  };

  const handleRemovePastWork = (id: number) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            pastWorks: prev.pastWorks.filter((w: any) => w.id !== id),
          }
        : null
    );
    setDeletedPastWorkIds((prev) => [...prev, id]);
  };

  const handleEditPastWork = (work: PastWork, index: number) => {
    setEditWork({ work, index });
  };

  const handleSaveEdit = (updatedWork: PastWork) => {
    if (editWork) {
      setProfile((prev) => {
        if (!prev) return null;
        const updatedPastWorks = [...prev.pastWorks];
        updatedPastWorks[editWork.index] = updatedWork;
        return { ...prev, pastWorks: updatedPastWorks };
      });
      setEditWork(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {profile.pastWorks.length > 1 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSortToggle}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {getSortIcon()}
            <span className="ml-2">{getSortLabel()}</span>
          </Button>
        </div>
      )}

      {/* Past Work Items */}
      <div className="space-y-3">
        {sortedPastWorks.map((work: PastWork) => {
          // Find the original index for editing purposes
          const originalIndex = profile.pastWorks.findIndex(
            (w) => w.id === work.id
          );
          return (
            <PastWorkItem
              key={work.id}
              work={work}
              onEdit={() => handleEditPastWork(work, originalIndex)}
              onDelete={() => handleRemovePastWork(work.id)}
            />
          );
        })}

        {profile.pastWorks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No past work added yet
          </div>
        )}
      </div>

      {/* Add New Work Button/Form */}
      {!showAddForm ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Past Work
        </Button>
      ) : (
        <AddPastWorkForm
          profile={profile}
          setProfile={setProfile}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Dialog */}
      {editWork && (
        <EditPastWorkDialog
          work={editWork.work}
          onSave={handleSaveEdit}
          onCancel={() => setEditWork(null)}
        />
      )}
    </div>
  );
};

export default PastWorkSection;
