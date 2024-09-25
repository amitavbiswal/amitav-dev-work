/** EnrichResponseTracerWebFilter.java */
package com.amitav.reactiveapp.filter;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@RequiredArgsConstructor
public class EnrichResponseTracerWebFilter implements WebFilter {

  private final Tracer tracer;

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    Span currentSpan = tracer.currentSpan();
    if (currentSpan != null) {
      // putting trace id value in [traceId] response header
      exchange.getResponse().getHeaders().add("traceId", currentSpan.context().traceId());
    }
    return chain.filter(exchange);
  }
}
