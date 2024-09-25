/** AppException.java */
package com.amitav.reactiveapp.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author amitav.biswal
 */
@Data
// @EqualsAndHashCode(callSuper = false)
public class ReactiveAppException extends ResponseStatusException {

  private static final long serialVersionUID = -1073819639705722524L;

  private final HttpStatus status;

  private final String message;

  /**
   * @param status
   * @param reason
   * @param cause
   */
  public ReactiveAppException(HttpStatusCode statusCode, String message, Throwable throwable) {
    super(statusCode, message, throwable);
    this.status = HttpStatus.resolve(statusCode.value());
    this.message = message;
  }
}
