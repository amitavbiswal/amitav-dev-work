package com.amitav.reactiveapp.repo;

import com.amitav.reactiveapp.entity.DriveEntity;
import org.springframework.data.r2dbc.repository.R2dbcRepository;

public interface DriveRepository extends R2dbcRepository<DriveEntity, Long> {}
