/** OpenAPIConfig.java */
package com.amitav.reactiveapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author amitav.biswal
 */
@Configuration
public class OpenAPIConfig {

  @Value("${reactiveapp.openapi.dev-url}")
  private String devUrl;

  @Value("${reactiveapp.openapi.prod-url}")
  private String prodUrl;

  @Bean
  public OpenAPI myOpenAPI() {
    Server devServer = new Server();
    devServer.setUrl(devUrl);
    devServer.setDescription("Server URL in Development environment");

    Server prodServer = new Server();
    prodServer.setUrl(prodUrl);
    prodServer.setDescription("Server URL in Production environment");

    Contact contact = new Contact();
    contact.setEmail("amitavbiswal@gmail.com");
    contact.setName("Amitav Biswal");
    contact.setUrl("https://www.google.com");

    License mitLicense =
        new License().name("MIT License").url("https://choosealicense.com/licenses/mit/");

    Info info =
        new Info()
            .title("Reactive Application API")
            .version("1.0")
            .contact(contact)
            .description("This API exposes endpoints to manage bins.")
            .termsOfService("https://www.google.com")
            .license(mitLicense);

    return new OpenAPI().info(info).servers(List.of(devServer, prodServer));
  }
}
