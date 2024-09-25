/** SecurityContextRepository.java */
package com.amitav.reactiveapp.secuirity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtServerSecurityContextRepository implements ServerSecurityContextRepository {

  private final JwtReactiveAuthenticationManager authenticationManager;

  @Override
  public Mono<Void> save(ServerWebExchange swe, SecurityContext sc) {
    throw new UnsupportedOperationException("Not supported yet.");
  }

  @Override
  public Mono<SecurityContext> load(ServerWebExchange exchange) {

    log.info("SecurityContextRepository.load-------------------------------S");
    String token = exchange.getRequest().getHeaders().getFirst("x-apple-sso-token");
    JwtAuthentication jwtAuthentication = new JwtAuthentication(token);
    log.info("SecurityContextRepository.load-------------------------------E");
    return authenticationManager.authenticate(jwtAuthentication).map(SecurityContextImpl::new);
  }
}
