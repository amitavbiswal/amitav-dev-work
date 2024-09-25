package com.amitav.reactiveapp;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
// @EnableR2dbcRepositories
// @EnableWebFlux
@EnableCaching
@OpenAPIDefinition
@EnableAsync
public class ReactiveAppApplication {

  public static void main(String[] args) {
    SpringApplication.run(ReactiveAppApplication.class, args);
  }
}
