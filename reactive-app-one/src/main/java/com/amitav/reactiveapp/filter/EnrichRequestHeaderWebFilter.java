/** EnrichRequestWebFilter.java */
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
public class EnrichRequestHeaderWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    exchange.getRequest().mutate().header("custom-header", "custom-header-value");
    return chain.filter(exchange);
  }
}
