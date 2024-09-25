/** AuthenticationManager.java */
package com.amitav.reactiveapp.secuirity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtReactiveAuthenticationManager implements ReactiveAuthenticationManager {

  private final JwtAuthenticationProvider jwtAuthenticationProvider;

  @Override
  public Mono<Authentication> authenticate(Authentication authentication) {
    log.info("JwtAuthenticationManager.authenticate----------------------------------->>");
    return Mono.just(jwtAuthenticationProvider.authenticate(authentication));
  }
}
