/** DriveService.java */
package com.amitav.reactiveapp.delegate;

import com.amitav.reactiveapp.dto.DriveDTO;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
public interface DriveService {

  /**
   * @param driveDto
   * @return
   */
  Mono<ResponseEntity<Mono<DriveDTO>>> createDrive(DriveDTO driveDto);
}
