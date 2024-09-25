/** FileUploadExceptionAdvice.java */
package com.amitav.reactiveapp.exception;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBufferLimitException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ServerWebExchange;

/**
 * @author amitav.biswal
 */
@RestControllerAdvice
@Slf4j
public class AppExceptionHandler {

  @ExceptionHandler(DataBufferLimitException.class)
  public ResponseEntity<Map<String, Object>> handle(
      DataBufferLimitException dble, ServerWebExchange exchange) {

    log.error("DataBufferLimitException :: ", dble);
    Map<String, Object> attributes = new HashMap<>();
    attributes.put("status", HttpStatus.EXPECTATION_FAILED.value());
    attributes.put("error", dble.getMessage());
    attributes.put("path", exchange.getRequest().getURI().getPath());
    // attributes.put("stackTrace", stackTraceToStr(dble));
    return new ResponseEntity<>(attributes, HttpStatus.EXPECTATION_FAILED);
  }

  @ExceptionHandler(WebExchangeBindException.class)
  public final ResponseEntity<Map<String, Object>> handle(
      WebExchangeBindException e, ServerWebExchange exchange) {

    log.error(
        "AppExceptionHandler.handle(WebExchangeBindException exception,ServerWebExchange exchange)---------------S");
    final BindingResult bindingResult = e.getBindingResult();
    final List<FieldError> fieldErrors = bindingResult.getFieldErrors();

    final Map<String, Object> attributes = new HashMap<>();
    fieldErrors.forEach(error -> attributes.put(error.getField(), error.getDefaultMessage()));

    fieldErrors.forEach(error -> attributes.put(error.getField(), error.getDefaultMessage()));

    attributes.put("status", HttpStatus.BAD_REQUEST.value());
    attributes.put("error", "input validation error");
    attributes.put("path", exchange.getRequest().getURI().getPath());
    log.error(
        "AppExceptionHandler.handle(WebExchangeBindException exception,ServerWebExchange exchange)---------------E");
    return new ResponseEntity<>(attributes, HttpStatus.BAD_REQUEST);
  }

  private String stackTrace(Exception exception) {
    log.error("AppExceptionHandler.stackTrace(Exception exception)---------------S");
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    exception.printStackTrace(pw);
    String stackTrace = sw.toString();
    stackTrace = stackTrace.substring(0, 500);
    log.error("AppExceptionHandler.stackTrace(Exception exception)---------------E");
    return stackTrace;
  }

  private String stackTraceToStr(Exception exception) {
    log.error("AppExceptionHandler.stackTraceToStr(Exception exception)---------------S");
    StackTraceElement[] stackTraceElements = exception.getStackTrace();

    stackTraceElements = Arrays.copyOfRange(stackTraceElements, 0, 10);

    StringBuilder sb = new StringBuilder();
    for (StackTraceElement stackTraceElement : stackTraceElements) {
      sb.append(stackTraceElement.toString()).append("  ");
    }
    log.error("AppExceptionHandler.stackTraceToStr(Exception exception)---------------E");
    return sb.toString();
  }
}
