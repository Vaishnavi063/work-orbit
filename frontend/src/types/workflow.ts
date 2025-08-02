import type { LucideIcon } from "lucide-react";
import type { Variants } from "framer-motion";

// Workflow step interface
export interface WorkflowStep {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

// Workflow diagram component props
export interface WorkflowDiagramProps {
    steps?: WorkflowStep[];
    className?: string;
}

// Arrow connector props for workflow diagram
export interface ArrowConnectorProps {
    className?: string;
    direction?: "right" | "down";
}

// Individual workflow step component props
export interface WorkflowStepProps {
    step: WorkflowStep;
    index: number;
    isLast: boolean;
    className?: string;
}

// Workflow animation variants for Framer Motion
export type WorkflowAnimationVariants = Variants;

// Default workflow steps data structure
export interface DefaultWorkflowSteps {
    PROJECT_POSTING: WorkflowStep;
    BIDDING: WorkflowStep;
    CONTRACT_CREATION: WorkflowStep;
    PROJECT_COMPLETION: WorkflowStep;
    PAYMENT: WorkflowStep;
}
