/** RecordFailurePredicate.java */
package com.amitav.reactiveapp.config;

import com.amitav.reactiveapp.exception.ReactiveAppException;
import io.netty.handler.timeout.TimeoutException;
import java.io.IOException;
import java.net.ConnectException;
import java.util.function.Predicate;
import org.springframework.web.reactive.function.client.WebClientRequestException;

/**
 * @author amitav.biswal
 */
public class FailurePredicate implements Predicate<Throwable> {

  @Override
  public boolean test(Throwable t) {
    return t instanceof ReactiveAppException
        || t instanceof ConnectException
        || t instanceof TimeoutException
        || t instanceof IOException
        || t instanceof WebClientRequestException;
  }
}
