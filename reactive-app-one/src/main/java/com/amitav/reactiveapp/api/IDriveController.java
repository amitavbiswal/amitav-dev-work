/** */
package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.DriveService;
import com.amitav.reactiveapp.dto.DriveDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import reactor.core.publisher.Mono;

/** */
public interface IDriveController {

  DriveService getDelegate();

  @PostMapping(
      path = {"/drives", "/drive"},
      consumes = {"application/json"},
      produces = {"application/json"})
  default Mono<ResponseEntity<Mono<DriveDTO>>> createDrive(
      @Valid @RequestBody(required = false) DriveDTO driveDto) {
    return getDelegate().createDrive(driveDto);
  }

  @GetMapping(
      path = {"/drives/{driveId}", "/drive/{driveId}"},
      // value = {"/drives/{driveId}", "/drive/{driveId}"},
      produces = {"application/json"})
  default Mono<ResponseEntity<Mono<DriveDTO>>> fetchDrive(@PathVariable("driveId") Long driveId) {
    return getDelegate().fetchDrive(driveId);
  }
}
