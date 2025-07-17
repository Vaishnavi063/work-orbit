import { FilePlus, PencilLine, Handshake } from "lucide-react";

import { WorkFlow } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

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
      <div className="grid md:grid-cols-3 gap-10 px-4 md:px-0">
        {WorkFlow.map((flow) => (
          <div key={flow.name} className="flex">
            <Card className="relative flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:scale-105 dark:bg-slate-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex flex-col items-center justify-center text-center">
                  {flow.icon && (
                    <flow.icon
                      className={`w-10 h-10 mb-4 ${
                        flow.color ??
                        "text-primary dark:text-primary-foreground"
                      }`}
                    />
                  )}
                  <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                    {flow.name}
                  </p>
                </div>
                <p className="text-muted-foreground dark:text-gray-400 mt-4 text-sm">
                  {flow.description}
                </p>
              </CardHeader>
              <CardFooter>
                <Button variant="default" className="w-full" size="lg">
                  {flow.button.text}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkSection;
