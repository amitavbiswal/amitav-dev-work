/** KafkaProducerConfig.java */
package com.amitav.reactiveapp.config;

import com.amitav.reactiveapp.dto.MessageDTO;
import com.amitav.reactiveapp.kafka.CustomePractitioner;
import io.micrometer.common.KeyValues;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.support.micrometer.KafkaRecordSenderContext;
import org.springframework.kafka.support.micrometer.KafkaTemplateObservationConvention;
import org.springframework.kafka.support.serializer.JsonSerializer;

/**
 * @author amitav.biswal
 */
@Configuration
public class KafkaProducerConfig {

  @Value("${kafka.bootstrap.servers}")
  private String bootstrapServer;

  @Value("${kafka.server.topics.topicd}")
  private String replyTopic;

  @Value("${kafka.consumer.groups.group4}")
  private String replyConsumerGrpId;

  @Bean
  public ProducerFactory<String, MessageDTO> producerFactory() {
    Map<String, Object> configProps = new HashMap<>();
    configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServer);
    configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    // configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

    // Custom partioner
    configProps.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, CustomePractitioner.class);

    // Config number of retries
    /*
     idempotent true make sure exactly only one message written to the Kafka .
     During retry and delivery timeout window , multiple retry will happen in order to
     maintain data consistency idempotent value to be set true.
    */
    configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
    configProps.put(ProducerConfig.ACKS_CONFIG, "all");

    // We should not depend on RETRIES_CONFIG and instead use delivery.timeout.ms to control retry
    // behavior

    // configProps.put(ProducerConfig.RETRIES_CONFIG, Integer.toString(Integer.MAX_VALUE));

    /*
     Allowing retries without setting max.in.flight.requests.per.connection to 1 will potentially change the ordering.
     By limiting the number of in-flight requests to 1 (default being 5), i.e., max.in.flight.requests.per.connection = 1,
     it guarantee that Kafka will preserve message order in the event.
    */
    configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 1);

    // Default value 2 minutes
    // delivery.timeout.ms [Time between message sent and acknowledgment received from the Broker]
    // delivery.timeout.ms>=linger.ms+retry.backoff.ms+request.timeout.ms

    configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 2 * 60 * 1000); // 3 minute timeout
    configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 6 * 1000); // 6 seconds
    configProps.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 12 * 1000); // 12 seconds

    // linger.ms, is the number of milliseconds a producer is willing to wait before sending
    // a batch out. And by default, it’s zero.
    configProps.put(ProducerConfig.LINGER_MS_CONFIG, 1); // 1 milliseconds

    // Default value 16 KB
    // configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 32); // 32 KB

    JsonSerializer<MessageDTO> jsonSerializer = new JsonSerializer<>();
    jsonSerializer.setAddTypeInfo(true);
    return new DefaultKafkaProducerFactory<>(configProps, new StringSerializer(), jsonSerializer);
  }

  @Bean
  public KafkaTemplate<String, MessageDTO> kafkaTemplate(
      ProducerFactory<String, MessageDTO> producerFactory) {
    KafkaTemplate<String, MessageDTO> kt = new KafkaTemplate<>(producerFactory);
    kt.setObservationEnabled(true);
    // kt.setObservationConvention(observationConvention());
    return kt;
  }

  @Bean
  public KafkaTemplate<String, MessageDTO> retryableTopicKafkaTemplate(
      ProducerFactory<String, MessageDTO> producerFactory) {
    KafkaTemplate<String, MessageDTO> kt = new KafkaTemplate<>(producerFactory);
    kt.setObservationEnabled(true);
    // kt.setObservationConvention(observationConvention());
    return kt;
  }

  // ----------------Configuration for Request and Reply ---------------------------Start

  @Bean
  public ConcurrentMessageListenerContainer<String, MessageDTO> repliesContainer(
      @Qualifier("kafkaListenerContainerFactory")
          ConcurrentKafkaListenerContainerFactory<String, MessageDTO> containerFactory) {

    ConcurrentMessageListenerContainer<String, MessageDTO> repliesContainer =
        containerFactory.createContainer(replyTopic);
    repliesContainer.getContainerProperties().setGroupId(replyConsumerGrpId);
    repliesContainer.setAutoStartup(true);
    return repliesContainer;
  }

  @Bean
  public ReplyingKafkaTemplate<String, MessageDTO, MessageDTO> replyingTemplate(
      @Qualifier("producerFactory") ProducerFactory<String, MessageDTO> pf,
      @Qualifier("repliesContainer")
          ConcurrentMessageListenerContainer<String, MessageDTO> repliesContainer) {

    return new ReplyingKafkaTemplate<>(pf, repliesContainer);
  }

  // ----------------Configuration for Request and Reply ---------------------------End

  private KafkaTemplateObservationConvention observationConvention() {
    return new KafkaTemplateObservationConvention() {
      @Override
      public KeyValues getLowCardinalityKeyValues(KafkaRecordSenderContext context) {
        return KeyValues.of(
            "topic", context.getDestination(), "id", String.valueOf(context.getRecord().key()));
      }
    };
  }
}
