package br.com.parkflow.repository;

import br.com.parkflow.entity.YardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface YardRepository extends JpaRepository<YardEntity, UUID> {
}

