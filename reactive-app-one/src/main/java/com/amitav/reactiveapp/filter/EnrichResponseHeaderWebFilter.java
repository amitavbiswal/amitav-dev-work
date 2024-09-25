/** EnrichResponseFilter.java */
package com.amitav.reactiveapp.filter;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Component
public class EnrichResponseHeaderWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    exchange.getResponse().getHeaders().add("X-API-VERSION", "1.0");
    return chain.filter(exchange);
  }
}
