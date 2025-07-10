import { Briefcase, UserCheck, ShieldCheck } from "lucide-react";

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
  },
  {
    name: "Hire Freelancer",
    description:
      "Browse through freelancer profiles, review proposals, and choose the right expert for your project.",
    icon: UserCheck,
    button: {
      text: "Get Started",
      variant: "default" as const,
    },
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
  },
];

export { WorkFlow };
