package com.workorbit.backend.Chat.Enum;

/**
 * Enum representing the possible status values for a milestone.
 * This is a standalone enum that can be used throughout the application
 * for consistency with the Milestone.MilestoneStatus enum.
 */
public enum MilestoneStatus {
    /**
     * Milestone has been created but work has not started yet.
     */
    PENDING,
    
    /**
     * Work on the milestone has started but is not yet complete.
     */
    IN_PROGRESS,
    
    /**
     * Milestone has been successfully completed.
     */
    COMPLETED,
    
    /**
     * Milestone has passed its due date without being completed.
     */
    OVERDUE
}