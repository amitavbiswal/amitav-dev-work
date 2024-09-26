/** */
package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.DriveService;
import com.amitav.reactiveapp.dto.DriveDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import reactor.core.publisher.Mono;

/** */
public interface IDriveController {

  DriveService getDelegate();

  @PostMapping(
      path = {"/drives"},
      consumes = {"application/json"},
      produces = {"application/json"})
  default Mono<ResponseEntity<Mono<DriveDTO>>> createDrive(DriveDTO driveDto) {
    return getDelegate().createDrive(driveDto);
  }
}
