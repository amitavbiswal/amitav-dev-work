/** CommonHelper.java */
package com.amitav.reactiveapp.delegate;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * @author amitav.biswal
 */
@Component
@Slf4j
public class CommonHelper {

  @Async
  public void sendEmail() {
    log.info("BinApiDelegateImpl.sendEmail------------------------------------------S");
    try {
      for (int i = 0; i < 10; i++) {
        log.info("CommonHelper.sendEmail.threadName =>" + Thread.currentThread().getName());
        Thread.sleep(5000);
      }
    } catch (InterruptedException e) {
      log.error("InterruptedException ::: ", e);
    }
    log.info("BinApiDelegateImpl.sendEmail------------------------------------------E");
  }
}
