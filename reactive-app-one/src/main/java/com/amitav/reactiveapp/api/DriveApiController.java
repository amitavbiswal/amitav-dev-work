/** DriveController.java */
package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.DriveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author amitav.biswal
 */
@RestController
@RequestMapping("/api/v1/reactiveapp")
@RequiredArgsConstructor
@Slf4j
public class DriveApiController implements IDriveController {

  private final DriveService DriveService;

  @Override
  public DriveService getDelegate() {
    log.info("DriveApiController:getDelegate--------------------------->>");
    return this.DriveService;
  }
}
