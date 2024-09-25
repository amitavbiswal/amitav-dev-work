/** DateUtil.java */
package com.amitav.reactiveapp.utils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

/**
 * @author amitav.biswal
 */
public class DateUtil {

  private DateUtil() {}

  public static LocalDateTime currentTimeInUtc() {
    return LocalDateTime.now()
        .atZone(ZoneId.systemDefault())
        .withZoneSameInstant(ZoneOffset.UTC)
        .toLocalDateTime();
  }
}
