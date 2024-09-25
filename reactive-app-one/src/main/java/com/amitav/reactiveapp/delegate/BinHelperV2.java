/** BinHelperV2.java */
package com.amitav.reactiveapp.delegate;

import com.amitav.reactiveapp.dto.BinDTO;
import com.amitav.reactiveapp.exception.ReactiveAppException;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

/**
 * @author amitav.biswal
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class BinHelperV2 {

  private final WebClient.Builder builder;

  @Value("${server.port}")
  private int port;

  public Flux<BinDTO> getBinByBinName(List<String> listBinName) {
    log.info("BinHelper:getBinByBinName(List<String> listBinName)--------------------------S");
    String targetPort = "";

    if (port == 8080) targetPort = "8090";
    if (port == 8090) targetPort = "8080";

    String BASE_URL = "http://localhost:" + targetPort;
    String URI_PATH = "/api/v1/reactiveapp/bin/byBinNames";

    log.info("BASE_URL=>" + BASE_URL);

    WebClient webClient = builder.baseUrl(BASE_URL).build();

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
            .retryWhen(
                Retry.backoff(3, Duration.ofSeconds(3))
                    .filter(Exception.class::isInstance)
                    .doBeforeRetry(
                        retrySignal ->
                            log.info(
                                "BinApiDelegateImpl:fetchBinByBinName:exception :: "
                                    + retrySignal.failure()
                                    + " :: Retry COUNT="
                                    + retrySignal.totalRetries()))
                    .onRetryExhaustedThrow(
                        (retryBackoffSpec, retrySignal) -> {
                          throw new ReactiveAppException(
                              HttpStatus.SERVICE_UNAVAILABLE,
                              "External Service failed to process after "
                                  + retrySignal.totalRetries()
                                  + " retries",
                              retrySignal.failure());
                        }));

    log.info("BinHelper:getBinByBinName(List<String> listBinName)--------------------------E");
    return additionalFluxBinDTO;
  }
}
