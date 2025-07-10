import { siteConfigs } from "@/config";
import { BadgeDollarSign, PanelsTopLeft, SquareCheckBig } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative pt-4 pb-8 sm:pb-16 sm:pt-10 px-4 sm:px-8">
      <div className="relative flex items-center justify-center flex-col sm:block sm:container z-[10]">
        <p className="text-md text-foreground">
          Welcome to{" "}
          <span className="text-black font-semibold">{siteConfigs.name}</span>
        </p>

        <h1 className="text-center sm:text-start text-2xl sm:text-2xl md:text-4xl xl:text-5xl font-bold mt-8 bg-gradient-to-r from-primary via-primary to-primary text-transparent bg-clip-text">
          Built for Freelancers, by Freelancers
        </h1>

        <p className="text-sm mt-2 text-muted-foreground text-center sm:text-start">
          {siteConfigs.name} helps freelancers stay organized, deliver on time,
          and get paid—without the chaos.
        </p>

        <div className="hidden sm:flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-5 text-sm">
          <div className="flex items-center space-x-2 text-foreground">
            <PanelsTopLeft size={18} />
            <span>Clients Post Projects</span>
          </div>

          <div className="border-l border-border h-[10px] hidden sm:block" />

          <div className="flex items-center space-x-2 text-foreground">
            <SquareCheckBig size={18} />
            <span>Freelancers Place Bids</span>
          </div>

          <div className="border-l border-border h-[10px] hidden sm:block" />

          <div className="flex items-center space-x-2 text-foreground">
            <BadgeDollarSign size={18} />
            <span>Contracts & Payments Secured</span>
          </div>
        </div>

        <div className="space-x-3 flex items-center mt-6 z-50">
          <Link
            to={"/find-work"}
            className="inline-flex text-primary-foreground items-center rounded-full px-5 py-2 text-sm font-light bg-primary hover:bg-primary/80 transition-all"
          >
            Start Freelancing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
