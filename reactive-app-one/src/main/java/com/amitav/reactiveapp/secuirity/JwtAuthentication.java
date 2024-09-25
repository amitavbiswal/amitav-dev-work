/** JWTAuthentication.java */
package com.amitav.reactiveapp.secuirity;

import java.security.Principal;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * @author amitav.biswal
 */
@RequiredArgsConstructor
public class JwtAuthentication implements Authentication {

  private static final long serialVersionUID = -7413661545737007586L;

  private final Object credentials;

  private Collection<GrantedAuthority> authorities;

  private boolean authenticated = false;

  private Object details;

  private Object principal;

  @Override
  public String getName() {
    if (this.getPrincipal() instanceof UserDetails userDetails) {
      return userDetails.getUsername();
    }
    if (this.getPrincipal() instanceof AuthenticatedPrincipal authenticatedPrincipal) {
      return authenticatedPrincipal.getName();
    }
    if (this.getPrincipal() instanceof Principal principal) {
      return principal.getName();
    }
    return (this.getPrincipal() == null) ? "" : this.getPrincipal().toString();
  }

  @Override
  public Collection<GrantedAuthority> getAuthorities() {
    return authorities;
  }

  public void setAuthorities(Collection<GrantedAuthority> authorities) {
    this.authorities = authorities;
  }

  @Override
  public Object getDetails() {
    return this.details;
  }

  public void setDetails(Object details) {
    this.details = details;
  }

  @Override
  public Object getPrincipal() {
    return principal;
  }

  @Override
  public boolean isAuthenticated() {
    return authenticated;
  }

  @Override
  public void setAuthenticated(boolean isAuthenticated) {
    this.authenticated = isAuthenticated;
  }

  @Override
  public Object getCredentials() {
    return credentials;
  }
}
