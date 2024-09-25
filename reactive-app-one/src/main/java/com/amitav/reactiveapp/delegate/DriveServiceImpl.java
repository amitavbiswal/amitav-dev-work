/** DriveServiceImpl.java */
package com.amitav.reactiveapp.delegate;

import static com.amitav.reactiveapp.utils.DateUtil.*;

import com.amitav.reactiveapp.dto.DriveDTO;
import com.amitav.reactiveapp.entity.DriveEntity;
import com.amitav.reactiveapp.repo.DriveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DriveServiceImpl implements DriveService {

  private final DriveRepository driveRepository;

  @Override
  public Mono<ResponseEntity<Mono<DriveDTO>>> createDrive(DriveDTO driveDto) {

    log.info("DriveServiceImpl.createDrive--------------------------------S");

    Mono<ResponseEntity<Mono<DriveDTO>>> monoResponse =
        driveRepository
            .save(
                DriveEntity.builder()
                    .serialNo(driveDto.getSerialNo())
                    .manufacturer(driveDto.getManufacturer())
                    .creationDate(currentTimeInUtc())
                    .build())
            .map(
                driveEntity ->
                    DriveDTO.builder()
                        .driveId(driveEntity.getDriveId())
                        .manufacturer(driveEntity.getManufacturer())
                        .serialNo(driveEntity.getSerialNo())
                        .creationDate(driveEntity.getCreationDate())
                        .creationDate(driveEntity.getModifiedDate())
                        .build())
            .map(value -> Mono.just(value))
            .map(value -> ResponseEntity.status(HttpStatus.CREATED).body(value));

    log.info("DriveServiceImpl.createDrive--------------------------------E");
    return monoResponse;
  }
}
