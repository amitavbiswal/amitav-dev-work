/** BinHelper.java */
package com.amitav.reactiveapp.delegate;

import static com.amitav.reactiveapp.utils.ReactiveAppConstant.*;

import com.amitav.reactiveapp.dto.BinDTO;
import com.amitav.reactiveapp.repo.BinRepository;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import io.github.resilience4j.reactor.retry.RetryOperator;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryRegistry;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

/**
 * @author amitav.biswal
 */
@Component
@Slf4j
// @RequiredArgsConstructor
public class BinHelperV1 {

  private final BinRepository binRepository;

  private final WebClient.Builder builder;

  private final CircuitBreaker circuitBreaker;
  private final Retry retry;

  @Value("${server.port}")
  private int port;

  public BinHelperV1(
      final BinRepository binRepository,
      final WebClient.Builder builder,
      final CircuitBreakerRegistry circuitBreakerRegistry,
      final RetryRegistry retryRegistry) {
    this.binRepository = binRepository;
    this.builder = builder;
    this.circuitBreaker = circuitBreakerRegistry.circuitBreaker(CIRCUIT_BREAKER_CONFIG_NAME);
    this.retry = retryRegistry.retry(RETRY_CONFIG_NAME);
  }

  // @CircuitBreaker(name = "fetchBinByBinNameCKTB", fallbackMethod = "fetchBinByBinNameFallback")
  public Flux<BinDTO> getBinByBinName(List<String> listBinName) {
    log.info("BinHelper:getBinByBinName(List<String> listBinName)--------------------------S");
    String targetPort = "";

    if (port == 8080) targetPort = "8090";
    if (port == 8090) targetPort = "8080";

    String BASE_URL = "http://localhost:" + targetPort;
    String URI_PATH = "/api/v1/reactiveapp/bin/byBinNames";

    log.info("BASE_URL=>" + BASE_URL);

    WebClient webClient =
        builder
            .baseUrl(BASE_URL)
            // .defaultHeader(
            // "Accept",
            // MediaType.APPLICATION_JSON_VALUE,
            // "Content-Type",
            // MediaType.APPLICATION_JSON_VALUE)
            .build();

    Flux<BinDTO> additionalFluxBinDTO =
        webClient
            .get()
            .uri(
                uriBuilder ->
                    uriBuilder
                        .path(URI_PATH)
                        .queryParam("binNames", String.join(",", listBinName))
                        .build())
            .accept(MediaType.ALL)
            .retrieve()
            .bodyToFlux(BinDTO.class)
            .timeout(Duration.ofSeconds(2))
            .transformDeferred(
                CircuitBreakerOperator.of(
                    circuitBreaker)) // ORDER - If written below, circuit breaker will record a
            // single failure after the max-retry
            .transformDeferred(
                RetryOperator.of(
                    retry)) // ORDER - If above, retry will complete before a failure is recorded by
            // the circuit breaker
            .onErrorResume(
                CallNotPermittedException.class::isInstance,
                throwable -> {
                  log.error(
                      "Circuit Breaker is in [{}].So providing fallback response without calling the actual API",
                      circuitBreaker.getState());
                  return fetchBinByBinNameFallback(listBinName);
                });

    log.info("BinHelper:getBinByBinName(List<String> listBinName)--------------------------E");
    return additionalFluxBinDTO;
  }

  public Flux<BinDTO> fetchBinByBinNameFallback(List<String> listBinName) {

    log.info("BinHelper.fetchBinByBinNameFallback-------------------------------------S");
    Flux<BinDTO> fluxBinDTO =
        binRepository
            .findByBinNameIn(listBinName)
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build());

    log.info("BinHelper.fetchBinByBinNameFallback-------------------------------------E");

    return fluxBinDTO;
  }
}
