/** MessageProducer.java */
package com.amitav.reactiveapp.kafka;

import com.amitav.reactiveapp.dto.MessageDTO;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

/**
 * @author amitav.biswal
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessageProducer1 {

  private final KafkaTemplate<String, MessageDTO> kafkaTemplate;

  public void sendMessage(String topic, String key, MessageDTO messageDTO) {
    log.info(
        "MessageProducer.sendMessage------------------------------------------------------------S");

    CompletableFuture<SendResult<String, MessageDTO>> future =
        kafkaTemplate.send(topic, key, messageDTO);

    /*ProducerRecord<String, MessageDTO> record = new ProducerRecord<>(topic, key, messageDTO);
    record.headers().add("correlation-id", "12345".getBytes());
    CompletableFuture<SendResult<String, MessageDTO>> future = kafkaTemplate.send(record);*/

    future.whenComplete(
        (result, ex) -> {
          if (ex == null) {
            /*log.info(
            "Sent message=["
                + messageDTO
                + "] with offset=["
                + result.getRecordMetadata().offset()
                + "]");*/
            log.info(
                "Sent Msg [{}] with offset=[{}]", messageDTO, result.getRecordMetadata().offset());
          } else {
            log.info("Unable to send message=[" + messageDTO + "] due to : " + ex.getMessage());
          }
        });
    log.info(
        "MessageProducer.sendMessage------------------------------------------------------------E");
  }

  public void sendMessage1(String topic, String key, MessageDTO messageDTO) {
    log.info(
        "MessageProducer.sendMessage------------------------------------------------------------S");

    CompletableFuture<SendResult<String, MessageDTO>> future =
        kafkaTemplate.send(topic, key, messageDTO);

    /*ProducerRecord<String, MessageDTO> record = new ProducerRecord<>(topic, key, messageDTO);
    record.headers().add("correlation-id", "12345".getBytes());
    CompletableFuture<SendResult<String, MessageDTO>> future = kafkaTemplate.send(record);*/

    future.whenComplete(
        (result, ex) -> {
          if (ex == null) {
            /*log.info(
            "Sent message=["
                + messageDTO
                + "] with offset=["
                + result.getRecordMetadata().offset()
                + "]");*/
            log.info(
                "Sent Msg [{}] with offset=[{}]", messageDTO, result.getRecordMetadata().offset());
          } else {
            log.info("Unable to send message=[" + messageDTO + "] due to : " + ex.getMessage());
          }
        });
    log.info(
        "MessageProducer.sendMessage------------------------------------------------------------E");
  }
}
