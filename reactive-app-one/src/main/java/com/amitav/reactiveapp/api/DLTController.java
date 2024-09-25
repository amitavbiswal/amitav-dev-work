/** DLTController.java */
package com.amitav.reactiveapp.api;

import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@RestController
@RequestMapping("/api/v1/reactiveapp/dlt")
@RequiredArgsConstructor
@Slf4j
public class DLTController {

  private final KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

  @PostMapping("/switch")
  public Mono<ResponseEntity<Map<String, String>>> startStopListener(
      @RequestBody Map<String, String> requestMap) {
    log.info("KafkaListenerEndpointRegistry:startStopListener---------------------------------S");
    Map<String, String> responseMap = new HashMap<>();
    String listenerId = requestMap.get("listenerId");

    if ("START".equalsIgnoreCase(requestMap.get("action"))) {
      kafkaListenerEndpointRegistry.getListenerContainer(listenerId).start();
      responseMap.put("state", "started");
    } else if ("STOP".equalsIgnoreCase(requestMap.get("action"))) {
      kafkaListenerEndpointRegistry.getListenerContainer(listenerId).stop();
      responseMap.put("state", "stopped");
    }
    responseMap.put(listenerId, listenerId);
    log.info("KafkaListenerEndpointRegistry:startStopListener---------------------------------E");
    return Mono.just(ResponseEntity.ok(responseMap));
  }
}
