/** MessageProducer2.java */
package com.amitav.reactiveapp.kafka;

import com.amitav.reactiveapp.dto.MessageDTO;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.requestreply.RequestReplyFuture;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

/**
 * @author amitav.biswal
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessageProducer3 {

  @Value("${kafka.server.topics.topicd}")
  private String replyTopic;

  private final ReplyingKafkaTemplate<String, MessageDTO, MessageDTO> kafkaTemplate;

  public void sendMessage(String topic, String key, MessageDTO messageDTO) {
    log.info(
        "MessageProducer3.sendMessage------------------------------------------------------------S");

    ProducerRecord<String, MessageDTO> record = new ProducerRecord<>(topic, key, messageDTO);

    // set reply topic in header
    record.headers().add(new RecordHeader(KafkaHeaders.REPLY_TOPIC, replyTopic.getBytes()));

    RequestReplyFuture<String, MessageDTO, MessageDTO> reqReplyfuture =
        kafkaTemplate.sendAndReceive(record, Duration.ofSeconds(30));

    // confirm if producer produced successfully
    try {
      SendResult<String, MessageDTO> sendResult =
          reqReplyfuture.getSendFuture().get(30, TimeUnit.SECONDS);
      // print all headers
      sendResult
          .getProducerRecord()
          .headers()
          .forEach(header -> log.info(header.key() + ":" + header.value()));
      // get consumer record
      ConsumerRecord<String, MessageDTO> consumerRecord = reqReplyfuture.get(30, TimeUnit.SECONDS);

      String rkey = consumerRecord.key();
      MessageDTO rmessageDTO = consumerRecord.value();

      log.info("rkey=>" + rkey);
      log.info("rmessageDTO=>" + rmessageDTO);

    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      log.error("Exception :: ", e);
    }

    log.info(
        "MessageProducer3.sendMessage------------------------------------------------------------E");
  }
}
