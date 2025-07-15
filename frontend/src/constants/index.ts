import { Briefcase, ShieldCheck, Users } from "lucide-react";

const WorkFlow = [
  {
    name: "Post a Job",
    description:
      "Create a detailed job listing to attract top freelance talent. Specify your project needs, deadlines, and budget.",
    icon: Briefcase,
    button: {
      text: "Get Started",
      variant: "default" as const,
    },
    color: "text-purple-500",
  },
  {
    name: "Hire Freelancers",
    description:
      "Browse through freelancer profiles, review proposals, and choose the right expert for your project.",
    icon: Users,
    button: {
      text: "Get Started",
      variant: "default" as const,
    },
    color: "text-indigo-500",
  },
  {
    name: "Make Secure Payment",
    description:
      "Pay safely through our secure platform and release funds once you're satisfied with the work delivered.",
    icon: ShieldCheck,
    button: {
      text: "Get Started",
      variant: "default" as const,
    },
    color: "text-cyan-500",
  },
];

export { WorkFlow };
