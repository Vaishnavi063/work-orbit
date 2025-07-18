import { useNavigate } from "react-router-dom";
import illustration from "/assets/working-man.png";

import { Button } from "@/components/ui/button";

const DeveloperIllustration = () => {
  const navigate = useNavigate();
  const redirect = (url: string) => navigate(url);

  return (
    <div className="mx-auto overflow-hidden p-4 md:p-8 shadow-sm relative my-16">
      <section
        className="flex flex-col md:flex-row items-center justify-between px-16 py-10 
        rounded-xl transition-colors duration-300
        bg-slate-200/60 backdrop-blur supports-[backdrop-filter]:bg-slate-200/60 dark:bg-slate-900"
      >
        <div className="mt-6 md:mt-0 md:mr-12 flex-shrink-0">
          <img
            src={illustration}
            alt="Freelancer working remotely"
            width={400}
            height={400}
            className="w-full max-w-sm h-auto object-contain drop-shadow-md dark:drop-shadow-none"
          />
        </div>

        <div className="max-w-xl text-center md:text-left">
          <h1
            className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 
            text-gray-900 dark:text-white"
          >
            Work from Anywhere. <br className="hidden md:block" /> Earn
            Everywhere.
          </h1>

          <p
            className="text-lg mb-6 text-muted-foreground 
            dark:text-gray-400"
          >
            Join thousands of freelancers building their future — one project at
            a time. Whether you're a developer, designer, or writer, get paid
            for what you do best.
          </p>

          <Button
            onClick={() => redirect("/auth/sign-up")}
            className="bg-primary text-primary-foreground py-3 px-6 rounded-lg text-base 
            hover:bg-primary/80 transition-colors duration-200 shadow-md cursor-pointer"
          >
            Become a Freelancer
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DeveloperIllustration;
