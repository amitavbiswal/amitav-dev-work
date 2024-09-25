/** ReactiveAppSecurityConfig.java */
package com.amitav.reactiveapp.config;

import com.amitav.reactiveapp.secuirity.JwtReactiveAuthenticationManager;
import com.amitav.reactiveapp.secuirity.JwtServerSecurityContextRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;

/**
 * @author amitav.biswal
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class AppSecurityConfig {

  public static final String[] WHITELIST_URL =
      new String[] {
        "/reactiveapp-docs",
        "/reactiveapp-docs/**",
        "/webjars/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/swagger-resources/**",
        "/swagger-resources",
        "/actuator/**",
      };

  private final JwtReactiveAuthenticationManager authenticationManager;

  private final JwtServerSecurityContextRepository securityContextRepository;

  @Bean
  SecurityWebFilterChain springWebFilterChain(ServerHttpSecurity serverHttpSecurity) {
    log.info("SecurityConfig:: springWebFilterChain:: reached {}", System.currentTimeMillis());
    return serverHttpSecurity
        .authenticationManager(authenticationManager)
        .securityContextRepository(securityContextRepository)
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
        .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
        .securityMatcher(
            new NegatedServerWebExchangeMatcher(
                ServerWebExchangeMatchers.pathMatchers(WHITELIST_URL)))
        .authorizeExchange(
            exchanges ->
                exchanges.pathMatchers(WHITELIST_URL).permitAll().anyExchange().authenticated())
        .build();
  }

  @Bean
  RoleHierarchy roleHierarchy() {
    var hierarchy = new RoleHierarchyImpl();
    hierarchy.setHierarchy("ROLE_DOORADMIN > ROLE_DOORUSER");
    return hierarchy;
  }

  @Primary
  @Bean
  MethodSecurityExpressionHandler customMethodSecurityExpressionHandler(
      RoleHierarchy roleHierarchy) {
    DefaultMethodSecurityExpressionHandler expressionHandler =
        new DefaultMethodSecurityExpressionHandler();
    expressionHandler.setRoleHierarchy(roleHierarchy);
    return expressionHandler;
  }
}
