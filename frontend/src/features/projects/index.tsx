import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PlusIcon } from "lucide-react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LayoutDashboardIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProjectList from "./components/ProjectList";
import ProjectCreateForm from "./components/ProjectCreateForm";
import ProjectDetails from "./components/ProjectDetails";

import { fetchProjects } from "@/store/slices/projects-slice";
import type { AppDispatch } from "@/store";
import useAuth from "@/hooks/use-auth";

const ProjectsListView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

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
          <ProjectList />
        </TabsContent>
        
        <TabsContent value="open" className="mt-6">
          <ProjectList filterStatus="OPEN" />
        </TabsContent>
        
        <TabsContent value="closed" className="mt-6">
          <ProjectList filterStatus="CLOSED" />
        </TabsContent>
      </Tabs>

      {/* Project Creation Modal */}
      <ProjectCreateForm 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};

const ClientProjectsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isClient = user?.role === "ROLE_CLIENT";

  const handleGoToDashboard = () => {
    navigate('/dashboard/profile');
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This dashboard is only available for clients.
          </p>
        </div>
        <Button 
          onClick={handleGoToDashboard}
          className="flex items-center gap-2"
        >
          <LayoutDashboardIcon className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ProjectsListView />} />
      <Route path="/:projectId" element={<ProjectDetails />} />
    </Routes>
  );
};

export default ClientProjectsDashboard; 