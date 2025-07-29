package com.workorbit.backend.Chat.Scheduler;

import com.workorbit.backend.Chat.Service.MilestoneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for milestone-related tasks such as automatic progress tracking
 * and overdue milestone detection.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MilestoneScheduler {

    private final MilestoneService milestoneService;
    
    /**
     * Scheduled task that runs every hour to check for overdue milestones
     * and update their status automatically.
     * <p>
     * This ensures that milestones are marked as overdue when their due date passes,
     * and appropriate notifications are sent to the contract chat.
     */
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void checkOverdueMilestones() {
        log.info("Running scheduled task to check for overdue milestones");
        
        try {
            milestoneService.updateMilestoneProgressTracking();
            log.info("Successfully completed milestone progress tracking update");
        } catch (Exception e) {
            log.error("Error during scheduled milestone progress tracking: {}", e.getMessage(), e);
        }
    }
}