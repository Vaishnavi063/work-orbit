import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { WorkFlow } from "@/constants";
import { FilePlus, PencilLine, Handshake } from "lucide-react";

const WorkSection = () => {
  return (
    <section className="py-8 md:py-10 container mx-auto">
      <div className="px-4 sm:px-0">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            It's Easy to Get Work Done
          </h1>
          <p className="text-sm sm:text-md text-muted-foreground mb-6">
            Connect with clients, submit bids, and get paid — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row text-foreground items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FilePlus className="h-4 w-4 text-primary" />
              <span>Clients post projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <PencilLine className="h-4 w-4 text-primary" />
              <span>Freelancers place bids</span>
            </div>
            <div className="flex items-center space-x-2">
              <Handshake className="h-4 w-4 text-primary" />
              <span>Contracts & payments secured</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-10">
        {WorkFlow.map((flow) => (
          <div key={flow.name} className="flex">
            <Card className="relative flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:scale-105">
              <CardHeader>
                <div className="flex flex-col items-center justify-center text-center">
                  {flow.icon && (
                    <flow.icon
                      className={`w-10 h-10 mb-4 ${
                        flow.color ?? "text-primary"
                      }`}
                    />
                  )}
                  <p className="text-lg font-medium mb-2">{flow.name}</p>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
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
