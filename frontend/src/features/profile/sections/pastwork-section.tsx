import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const PastWorkSection: React.FC<PastWorkSectionProps> = ({
  profile,
  setProfile,
  setDeletedPastWorkIds
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editWork, setEditWork] = useState<{ work: PastWork; index: number } | null>(null);

  const handleRemovePastWork = (id: number) => {
    setProfile(prev => prev ? {
      ...prev,
      pastWorks: prev.pastWorks.filter((w: any) => w.id !== id)
    } : null);
    setDeletedPastWorkIds(prev => [...prev, id]);
  };

  const handleEditPastWork = (work: PastWork, index: number) => {
    setEditWork({ work, index });
  };

  const handleSaveEdit = (updatedWork: PastWork) => {
    if (editWork) {
      setProfile(prev => {
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
      {/* Past Work Items */}
      <div className="space-y-3">
        {profile.pastWorks.map((work: PastWork, index: number) => (
          <PastWorkItem
            key={work.id}
            work={work}
            onEdit={() => handleEditPastWork(work, index)}
            onDelete={() => handleRemovePastWork(work.id)}
          />
        ))}
        
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