/** JwtServerAuthenticationConverter.java */
package com.amitav.reactiveapp.secuirity;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Component
@Slf4j
public class JwtServerAuthenticationConverter implements ServerAuthenticationConverter {

  @Override
  public Mono<Authentication> convert(ServerWebExchange exchange) {
    log.info(
        "JwtServerAuthenticationConverter.ServerAuthenticationConverter-------------------------------S");

    String token = exchange.getRequest().getHeaders().getFirst("x-apple-sso-token");
    JwtAuthentication jwtAuthentication = new JwtAuthentication(token);
    log.info(
        "JwtServerAuthenticationConverter.ServerAuthenticationConverter-------------------------------E");
    return Mono.just(jwtAuthentication);
  }
}
