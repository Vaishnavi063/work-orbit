package com.workorbit.backend.Repository;
import com.workorbit.backend.Entity.Bids;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bids, Long> {
    List<Bids> findByProject_Id(Long projectId);
    List<Bids> findByFreelancer_Id(Long freelancerId);
}
