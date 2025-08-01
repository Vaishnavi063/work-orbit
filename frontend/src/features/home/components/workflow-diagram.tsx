import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  FileCheck, 
  CheckCircle, 
  CreditCard,
  ArrowRight,
  ArrowDown
} from "lucide-react";

import type { WorkflowStep, WorkflowDiagramProps } from "@/types/workflow";

// Workflow steps data following the requirements: Project Posting → Bidding → Contract Creation → Project Completion → Payment
const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Project Posting",
    description: "Clients post detailed project requirements with budget and timeline",
    icon: FileText,
    color: "text-blue-500"
  },
  {
    id: 2,
    title: "Bidding",
    description: "Freelancers review projects and submit competitive proposals",
    icon: Users,
    color: "text-green-500"
  },
  {
    id: 3,
    title: "Contract Creation",
    description: "Accepted bids create secure contracts and lock project status",
    icon: FileCheck,
    color: "text-purple-500"
  },
  {
    id: 4,
    title: "Project Completion",
    description: "Freelancers deliver work and clients review the final results",
    icon: CheckCircle,
    color: "text-orange-500"
  },
  {
    id: 5,
    title: "Payment",
    description: "Secure payment processing through the platform wallet system",
    icon: CreditCard,
    color: "text-cyan-500"
  }
];

// Arrow connector component
const ArrowConnector = ({ direction = "right", className = "" }: { direction?: "right" | "down"; className?: string }) => {
  const ArrowIcon = direction === "right" ? ArrowRight : ArrowDown;
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ArrowIcon className="w-6 h-6 text-muted-foreground/60" />
    </div>
  );
};

// Individual workflow step component
const WorkflowStepComponent = ({ step, index }: { step: WorkflowStep; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col items-center text-center group"
    >
      {/* Icon container */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <step.icon className={`w-8 h-8 ${step.color}`} />
        </div>
        {/* Step number badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
          {step.id}
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="max-w-xs">
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
};

const WorkflowDiagram = ({ steps = workflowSteps, className = "" }: WorkflowDiagramProps) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop layout - horizontal flow */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <WorkflowStepComponent 
                step={step} 
                index={index} 
              />
              {index < steps.length - 1 && (
                <ArrowConnector direction="right" className="mx-8" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tablet layout - 2x3 grid with arrows */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <WorkflowStepComponent 
                step={step} 
                index={index} 
              />
              {/* Add arrows for flow direction */}
              {index === 0 && (
                <ArrowConnector direction="right" className="absolute top-1/2 right-0 transform translate-x-4" />
              )}
              {index === 1 && (
                <ArrowConnector direction="down" className="mt-4" />
              )}
              {index === 2 && (
                <ArrowConnector direction="right" className="absolute top-1/2 right-0 transform translate-x-4" />
              )}
              {index === 3 && (
                <ArrowConnector direction="down" className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile layout - vertical flow */}
      <div className="block md:hidden">
        <div className="flex flex-col items-center space-y-8 max-w-sm mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <WorkflowStepComponent 
                step={step} 
                index={index} 
              />
              {index < steps.length - 1 && (
                <ArrowConnector direction="down" className="mt-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagram;