/** RequestMonitorWebFilter.java */
package com.amitav.reactiveapp.filter;

import io.micrometer.context.ContextSnapshotFactory;
import io.micrometer.observation.contextpropagation.ObservationThreadLocalAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Component
public class RequestMonitorWebFilter implements WebFilter {
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    return chain
        .filter(exchange)
        /**
         * !! IMPORTANT STEP !! Preparing context for the Tracer Span used in TracerConfiguration
         */
        .contextWrite(
            context -> {
              ContextSnapshotFactory.builder()
                  .build()
                  .setThreadLocalsFrom(context, ObservationThreadLocalAccessor.KEY);
              return context;
            });
  }
}
