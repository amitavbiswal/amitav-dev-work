/** CustomAuthenticationProvider.java */
package com.amitav.reactiveapp.secuirity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

/**
 * @author amitav.biswal
 */
public interface IAuthenticationProvider {

  /**
   * @param authentication
   * @return
   * @throws AuthenticationException
   */
  Authentication authenticate(Authentication authentication) throws AuthenticationException;

  /**
   * @param authentication
   * @return
   */
  boolean supports(Authentication authentication);
}
