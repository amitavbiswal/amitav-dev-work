/** KafkaConsumerConfig.java */
package com.amitav.reactiveapp.config;

import com.amitav.reactiveapp.dto.MessageDTO;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.ConversionException;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.listener.adapter.RecordFilterStrategy;
import org.springframework.kafka.support.serializer.DeserializationException;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.messaging.converter.MessageConversionException;
import org.springframework.messaging.handler.invocation.MethodArgumentResolutionException;
import org.springframework.util.backoff.FixedBackOff;

/**
 * @author amitav.biswal
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumerConfig {

  @Value("${kafka.server.topics.topica}")
  private String deadLetterTopic;

  private ConcurrentHashMap<String, String> mapDB = new ConcurrentHashMap<>();

  @Bean
  public ConsumerFactory<String, MessageDTO> consumerFactory() {

    Map<String, Object> configProps = new HashMap<>();
    configProps.put(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092,localhost:9093,localhost:9094");
    configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "${kafka.consumer.group}");
    configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    // configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

    JsonDeserializer<MessageDTO> payloadJsonDeserializer = new JsonDeserializer<>();
    payloadJsonDeserializer.addTrustedPackages("*");

    return new DefaultKafkaConsumerFactory<>(
        configProps, new StringDeserializer(), payloadJsonDeserializer);
  }

  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, MessageDTO> kafkaListenerContainerFactory(
      KafkaTemplate<String, MessageDTO> kafkaTemplate, DefaultErrorHandler errorHandler) {

    ConcurrentKafkaListenerContainerFactory<String, MessageDTO> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.getContainerProperties().setObservationEnabled(true);
    factory.setConsumerFactory(consumerFactory());
    // factory.setRecordFilterStrategy(filter());
    factory.setCommonErrorHandler(errorHandler);
    factory.setReplyTemplate(kafkaTemplate);
    return factory;
  }

  @Bean
  DefaultErrorHandler errorHandler(KafkaTemplate<String, MessageDTO> kafkaTemplate) {
    /*var exponentialBackOff = new ExponentialBackOffWithMaxRetries(2);
    exponentialBackOff.setInitialInterval(1000L);
    exponentialBackOff.setMultiplier(2L);
    exponentialBackOff.setMaxInterval(4000L);*/

    var recoverer =
        new DeadLetterPublishingRecoverer(
            kafkaTemplate,
            (rec, ex) -> new TopicPartition(deadLetterTopic + "-dlt", rec.partition()));

    FixedBackOff fixedBackOff = new FixedBackOff(2000L, 3);
    DefaultErrorHandler errorHandler = new DefaultErrorHandler(recoverer, fixedBackOff);

    errorHandler.setRetryListeners(
        (consumerRecord, ex, deliveryAttempt) -> {
          log.info(
              "Failed Record in Retry Listener, Exception: {}, deliveryAttempt: {}",
              ex.getMessage(),
              deliveryAttempt);
        });

    var exceptionsToIgnoreList =
        List.of(
            DeserializationException.class,
            MessageConversionException.class,
            ConversionException.class,
            MethodArgumentResolutionException.class,
            NoSuchMethodException.class,
            ClassCastException.class);
    exceptionsToIgnoreList.forEach(errorHandler::addNotRetryableExceptions);
    return errorHandler;
  }

  /*
   * If record is already processed don't process the records again.
   */
  private RecordFilterStrategy<? super String, ? super MessageDTO> filter() {
    return new RecordFilterStrategy<String, MessageDTO>() {
      @Override
      public boolean filter(ConsumerRecord<String, MessageDTO> consumerRecord) {
        log.info("KafkaConsumerConfig:filter------------------------S");
        MessageDTO messageDTO = consumerRecord.value();
        if (mapDB.get(messageDTO.getId()) != null) {
          log.info("**********DUPLICATE RECORD*********");
          return true;
        } else mapDB.put(messageDTO.getId(), "DEFAULT_VALUE");
        log.info("KafkaConsumerConfig:filter------------------------E");
        return false;
      }
    };
  }
}
