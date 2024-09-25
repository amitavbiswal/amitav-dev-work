/** CustomePractitioner.java */
package com.amitav.reactiveapp.kafka;

import java.util.Map;
import java.util.Random;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.Partitioner;
import org.apache.kafka.common.Cluster;

/**
 * @author amitav.biswal
 */
@Slf4j
public class CustomePractitioner implements Partitioner {

  private Random random = new Random();

  @Override
  public void configure(Map<String, ?> configs) {
    log.info("CustomePractitioner.configure------------------------------->>");
  }

  @Override
  public int partition(
      String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {

    if (key != null) {
      String keyStr = (String) key;
      int partitionKey = keyStr.length();
      return partitionKey % 3;
    } else {
      return random.nextInt(3);
    }
  }

  @Override
  public void close() {
    log.info("CustomePractitioner.close------------------------------->>");
  }
}
