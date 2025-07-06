package com.workorbit.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workorbit.backend.Entity.Contract;

@Repository
public interface ContractRepository extends JpaRepository<Contract,Long>{
}
