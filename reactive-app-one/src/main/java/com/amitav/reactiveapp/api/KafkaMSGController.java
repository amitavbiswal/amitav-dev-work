/** KafkaMessageController.java */
package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.dto.MessageDTO;
import com.amitav.reactiveapp.kafka.MessageProducer1;
import com.amitav.reactiveapp.kafka.MessageProducer3;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@RestController
@RequestMapping("/api/v1/kafka")
@RequiredArgsConstructor
@Slf4j
public class KafkaMSGController {

  private final MessageProducer1 messageProducer1;

  private final MessageProducer3 messageProducer3;

  @PostMapping("/message")
  public Mono<ResponseEntity<MessageDTO>> sendMsg1(
      @Valid @RequestBody(required = false) MessageDTO messageDTO) {
    log.info("KafkaMSGController.sendMsg--------------------------------------------S");
    log.info("messageDTO=>" + messageDTO);
    if ("topic.a".equalsIgnoreCase(messageDTO.getTopic()))
      messageProducer1.sendMessage(messageDTO.getTopic(), messageDTO.getId(), messageDTO);
    else if ("topic.c".equalsIgnoreCase(messageDTO.getTopic()))
      messageProducer3.sendMessage(messageDTO.getTopic(), messageDTO.getId(), messageDTO);

    log.info("KafkaMSGController.sendMsg--------------------------------------------E");
    return Mono.just(ResponseEntity.ok(messageDTO));
  }
}
