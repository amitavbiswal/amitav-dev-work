/** JwtAuthenticationProvider.java */
package com.amitav.reactiveapp.secuirity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

/**
 * @author amitav.biswal
 */
@Slf4j
@Component
public class JwtAuthenticationProvider implements IAuthenticationProvider {

  private final List<String> listValidToken = Arrays.asList("ABCD1234", "WXYZ1234");

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {

    log.info(
        "JwtAuthenticationProvider.authenticate--------------------------------------------------------S");
    String appToken = authentication.getCredentials().toString();
    JwtAuthentication appAuthToken = null;
    if (ObjectUtils.isEmpty(appToken)) {
      throw new InsufficientAuthenticationException("No appToken in request");
    } else {

      List<GrantedAuthority> authorities = new ArrayList<>();

      if (listValidToken.contains(appToken) && listValidToken.get(0).equals(appToken)) {

        authorities.add(new SimpleGrantedAuthority("ROLE_DOORUSER"));

        appAuthToken = new JwtAuthentication(appToken);
        appAuthToken.setAuthorities(authorities);
      } else if (listValidToken.contains(appToken) && listValidToken.get(1).equals(appToken)) {

        // authorities.add(new SimpleGrantedAuthority("ROLE_DOORUSER"));
        authorities.add(new SimpleGrantedAuthority("ROLE_DOORADMIN"));

        appAuthToken = new JwtAuthentication(appToken);
        appAuthToken.setAuthorities(authorities);
      } else {
        throw new BadCredentialsException("appToken is invalid");
      }
      appAuthToken.setAuthenticated(true);
    }
    log.info(
        "JwtAuthenticationProvider.authenticate--------------------------------------------------------E");
    return appAuthToken;
  }

  @Override
  public boolean supports(Authentication authentication) {
    return authentication instanceof JwtAuthentication;
  }
}
