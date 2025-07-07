package com.workorbit.backend.Repository;
import com.workorbit.backend.Entity.Bids;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BidRepository extends JpaRepository<Bids, Long> {
}
