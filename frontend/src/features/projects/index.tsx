import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProjectList from "./components/ProjectList";
import ProjectCreateForm from "./components/ProjectCreateForm";
import ProjectDetailsModal from "./components/ProjectDetailsModal";

import { fetchProjects } from "@/store/slices/projects-slice";
import type { AppDispatch } from "@/store";
import type { Project } from "./types";
import useAuth from "@/hooks/use-auth";

const ClientProjectsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, authToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (authToken) {
      dispatch(fetchProjects(authToken));
    }
  }, [dispatch, authToken]);

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleProjectCreated = () => {
    if (authToken) {
      dispatch(fetchProjects(authToken));
    }
  };

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
  };

  const isClient = user?.role === "ROLE_CLIENT";

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            This dashboard is only available for clients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Button onClick={handleCreateProject}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Post New Project
        </Button>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Projects</TabsTrigger>
          <TabsTrigger value="open">Open Projects</TabsTrigger>
          <TabsTrigger value="closed">Closed Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <ProjectList onViewDetails={handleViewProjectDetails} />
        </TabsContent>
        
        <TabsContent value="open" className="mt-6">
          <ProjectList onViewDetails={handleViewProjectDetails} filterStatus="OPEN" />
        </TabsContent>
        
        <TabsContent value="closed" className="mt-6">
          <ProjectList onViewDetails={handleViewProjectDetails} filterStatus="CLOSED" />
        </TabsContent>
      </Tabs>

      {/* Project Creation Modal */}
      <ProjectCreateForm 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleProjectCreated}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

export default ClientProjectsDashboard; 