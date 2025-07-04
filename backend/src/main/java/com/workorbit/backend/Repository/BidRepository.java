package com.workorbit.backend.Repository;
import com.workorbit.backend.Entity.Bids;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bids, Long> {
}
