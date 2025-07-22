import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import useAuth from "@/hooks/use-auth";
import useGetFreelancerProfile from "@/features/freelancer/hooks/use-get-freelancer-profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import apis from "@/features/freelancer/apis";

const ProfileUpdate = () => {
  const { user } = useAuth();
  if (!user || !user.id || !user.token) {
    return <div className="text-center py-10">User not found or not authenticated.</div>;
  }
  const { data: freelancerData, isLoading, error } = useGetFreelancerProfile(user.id.toString(), user.token);

  const [profile, setProfile] = useState<any>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newPastWork, setNewPastWork] = useState({ title: "", link: "", description: "" });

  // Edit past work dialog state
  const [editPastWorkOpen, setEditPastWorkOpen] = useState(false);
  const [editPastWork, setEditPastWork] = useState<any>(null);
  const [editPastWorkIndex, setEditPastWorkIndex] = useState<number | null>(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track deleted past works
  const [deletedPastWorkIds, setDeletedPastWorkIds] = useState<number[]>([]);

  useEffect(() => {
    if (freelancerData) setProfile(freelancerData);
  }, [freelancerData]);

  if (isLoading || !profile) {
    return <div className="text-center py-10">Loading profile...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">Failed to load profile.</div>;
  }

  // Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, name: e.target.value });
  };

  // Rating
  const handleRatingChange = (delta: number) => {
    setProfile((prev: any) => ({ ...prev, rating: Math.max(0, Math.min(5, +(prev.rating + delta).toFixed(1))) }));
  };

  // Skills
  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) });
  };

  // Past Work
  const handleAddPastWork = () => {
    if (newPastWork.title && newPastWork.link && newPastWork.description) {
      setProfile({
        ...profile,
        pastWorks: [
          ...profile.pastWorks,
          // Do not assign id for new past work
          { title: newPastWork.title, link: newPastWork.link, description: newPastWork.description }
        ]
      });
      setNewPastWork({ title: "", link: "", description: "" });
    }
  };
  const handleRemovePastWork = (id: number) => {
    setProfile({ ...profile, pastWorks: profile.pastWorks.filter((w: any) => w.id !== id) });
    setDeletedPastWorkIds((prev) => [...prev, id]);
  };

  // Open edit dialog for past work
  const openEditPastWork = (work: any, index: number) => {
    setEditPastWork(work);
    setEditPastWorkIndex(index);
    setEditPastWorkOpen(true);
  };
  // Save changes from edit dialog
  const handleEditPastWorkSave = () => {
    if (editPastWorkIndex !== null && editPastWork) {
      const updatedPastWorks = [...profile.pastWorks];
      updatedPastWorks[editPastWorkIndex] = editPastWork;
      setProfile({ ...profile, pastWorks: updatedPastWorks });
      setEditPastWorkOpen(false);
    }
  };

  // Helper to check if id is a real backend id (e.g., < 1e6)
  const isRealBackendId = (id: any) => typeof id === "number" && id < 1e6;

  // Save handler
  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    // Validate required fields
    if (!profile.name || profile.name.trim() === "") {
      setSaveError("Name is required.");
      return;
    }
    if (typeof profile.rating !== "number" || profile.rating < 0 || profile.rating > 5) {
      setSaveError("Rating must be between 0 and 5.");
      return;
    }
    if (!Array.isArray(profile.skills) || profile.skills.length === 0) {
      setSaveError("At least one skill is required.");
      return;
    }
    if (!Array.isArray(profile.pastWorks) || profile.pastWorks.some((w: any) => !w.title || !w.link || !w.description)) {
      setSaveError("All past works must have title, link, and description.");
      return;
    }
    setSaveLoading(true);
    try {
      // Prepare pastWorks payload
      const pastWorksPayload = [
        // Updated (existing, not deleted)
        ...profile.pastWorks.filter((w: any) => isRealBackendId(w.id) && !deletedPastWorkIds.includes(w.id)).map((w: any) => ({
          id: w.id,
          title: w.title,
          link: w.link,
          description: w.description
        })),
        // New (no id)
        ...profile.pastWorks.filter((w: any) => !isRealBackendId(w.id)).map((w: any) => ({
          title: w.title,
          link: w.link,
          description: w.description
        })),
        // Deleted (include all fields)
        ...deletedPastWorkIds.map((id) => {
          const deleted = originalPastWorkById(id);
          return deleted ? {
            id,
            toDelete: true,
            title: deleted.title,
            link: deleted.link,
            description: deleted.description
          } : { id, toDelete: true, title: "deleted", link: "deleted", description: "deleted" };
        })
      ];
      await apis.updateFreelancerProfile({
        authToken: user.token,
        id: user.id.toString(),
        data: {
          name: profile.name,
          rating: profile.rating,
          skills: profile.skills,
          pastWorks: pastWorksPayload
        }
      });
      setSaveSuccess(true);
      setDeletedPastWorkIds([]); // Clear deleted after successful save
    } catch (err: any) {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper to get original past work by id from freelancerData
  const originalPastWorkById = (id: number) => {
    if (!freelancerData || !Array.isArray(freelancerData.pastWorks)) return null;
    return freelancerData.pastWorks.find((w: any) => w.id === id) || null;
  };

  return (
    <div className="relative w-screen max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-muted border rounded-xl shadow-md p-4 sm:p-8 md:p-10 relative">
        <h1 className="text-3xl font-bold mb-6">Update Profile</h1>
        <div className="flex flex-col gap-6">
          {/* Name */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Name</p>
            <input
              className="border border-gray-300 rounded p-2 w-full bg-gray-100"
              value={profile.name}
              onChange={handleNameChange}
            />
          </div>
          {/* Email (read-only) */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Email Address</p>
            <input
              className="border border-gray-300 rounded p-2 w-full bg-gray-100"
              value={profile.email}
              readOnly
            />
          </div>
          {/* Rating */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Rating</p>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded text-lg"
                onClick={() => handleRatingChange(-0.1)}
                type="button"
              >
                -
              </button>
              <input
                className="border border-gray-300 rounded p-2 w-24 text-center bg-gray-100"
                value={profile.rating}
                readOnly
              />
              <button
                className="px-2 py-1 bg-gray-200 rounded text-lg"
                onClick={() => handleRatingChange(0.1)}
                type="button"
              >
                +
              </button>
              <span className="ml-2">/ 5</span>
            </div>
          </div>
          {/* Skills */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Skills</p>
            <div className="border border-gray-300 rounded p-2 bg-gray-100 flex flex-wrap gap-2 mb-2">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-800 flex items-center gap-1">
                  {skill}
                  <button
                    className="ml-1 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveSkill(skill)}
                    type="button"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
              <input
                className="border rounded px-2 py-1 text-sm"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Add skill"
                onKeyDown={e => { if (e.key === "Enter") handleAddSkill(); }}
              />
              <button
                className="bg-blue-500 text-white rounded px-2 py-1 ml-1"
                onClick={handleAddSkill}
                type="button"
              >
                <FaPlus size={14} />
              </button>
            </div>
          </div>
          {/* Past Work */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Past Work</p>
            <div className="flex flex-col gap-2">
              {profile.pastWorks.map((work: any, idx: number) => (
                <div key={work.id} className="border border-gray-300 rounded p-2 bg-gray-100 flex flex-col gap-1 relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700" type="button" onClick={() => openEditPastWork(work, idx)}><FaEdit size={14} /></button>
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleRemovePastWork(work.id)} type="button"><FaTrash size={14} /></button>
                  </div>
                  <div className="font-bold">{work.title}</div>
                  <a href={work.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {work.link}
                  </a>
                  <div className="text-gray-700">{work.description}</div>
                </div>
              ))}
              {/* Add new past work */}
              <div className="flex flex-col gap-1 border border-dashed border-gray-300 rounded p-2 bg-gray-50 mt-2">
                <input
                  className="border border-gray-300 rounded p-1 mb-1"
                  placeholder="Title"
                  value={newPastWork.title}
                  onChange={e => setNewPastWork({ ...newPastWork, title: e.target.value })}
                />
                <input
                  className="border border-gray-300 rounded p-1 mb-1"
                  placeholder="Link"
                  value={newPastWork.link}
                  onChange={e => setNewPastWork({ ...newPastWork, link: e.target.value })}
                />
                <input
                  className="border border-gray-300 rounded p-1 mb-1"
                  placeholder="Description"
                  value={newPastWork.description}
                  onChange={e => setNewPastWork({ ...newPastWork, description: e.target.value })}
                />
                <button
                  className="bg-blue-500 text-white rounded px-2 py-1 mt-1 self-start"
                  onClick={handleAddPastWork}
                  type="button"
                >
                  <FaPlus size={14} className="inline mr-1" /> Add Past Work
                </button>
              </div>
            </div>
          </div>
          {/* Save Button */}
          {saveError && <div className="text-red-500 font-medium text-center mt-2">{saveError}</div>}
          {saveSuccess && <div className="text-green-600 font-medium text-center mt-2">Profile updated successfully!</div>}
          <button
            className="bg-green-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-green-700 transition mt-6 self-end disabled:opacity-60"
            onClick={handleSave}
            type="button"
            disabled={saveLoading}
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {/* Edit Past Work Dialog */}
      <Dialog open={editPastWorkOpen} onOpenChange={setEditPastWorkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Past Work</DialogTitle>
          </DialogHeader>
          {editPastWork && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditPastWorkSave();
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                className="border border-gray-300 rounded p-2"
                placeholder="Title"
                value={editPastWork.title}
                onChange={e => setEditPastWork({ ...editPastWork, title: e.target.value })}
                required
              />
              <label className="text-sm font-medium text-muted-foreground">Link</label>
              <input
                className="border border-gray-300 rounded p-2"
                placeholder="Link"
                value={editPastWork.link}
                onChange={e => setEditPastWork({ ...editPastWork, link: e.target.value })}
                required
              />
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <input
                className="border border-gray-300 rounded p-2"
                placeholder="Description"
                value={editPastWork.description}
                onChange={e => setEditPastWork({ ...editPastWork, description: e.target.value })}
                required
              />
              <DialogFooter>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-green-700 transition"
                  type="submit"
                >
                  Save
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileUpdate; 