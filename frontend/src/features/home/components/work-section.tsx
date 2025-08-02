import { FilePlus, PencilLine, Handshake } from "lucide-react";

import WorkflowDiagram from "./workflow-diagram";

const WorkSection = () => {
  return (
    <section className="py-8 md:py-10 container mx-auto">
      <div className="px-4 sm:px-0">
        <div className="text-center mb-16">
          <span
            className="
              inline-block px-4 py-1 rounded-full 
              bg-primary/10 dark:bg-primary/60 
              text-primary dark:text-primary-foreground 
              text-sm font-medium mb-4
            "
          >
            How It Works
          </span>
          <h1
            className="
              text-4xl md:text-5xl font-bold tracking-tight 
              text-primary dark:text-primary-foreground 
              mb-4
            "
          >
            It's Easy to Get Work Done
          </h1>
          <p className="text-sm sm:text-md text-muted-foreground dark:text-gray-400 mb-6">
            Connect with clients, submit bids, and get paid — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row text-foreground dark:text-gray-300 items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FilePlus className="h-4 w-4 text-primary dark:text-primary-foreground" />
              <span>Clients post projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <PencilLine className="h-4 w-4 text-primary dark:text-primary-foreground" />
              <span>Freelancers place bids</span>
            </div>
            <div className="flex items-center space-x-2">
              <Handshake className="h-4 w-4 text-primary dark:text-primary-foreground" />
              <span>Contracts & payments secured</span>
            </div>
          </div>
        </div>
      </div>
      {/* New workflow diagram component */}
      <div className="px-4 md:px-0">
        <WorkflowDiagram className="mt-8" />
      </div>
    </section>
  );
};

export default WorkSection;
