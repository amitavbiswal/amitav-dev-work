/** RedisCacheConfig.java */
package com.amitav.reactiveapp.config;

import java.time.Duration;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

/**
 * @author amitav.biswal
 */
@Configuration
public class RedisCacheConfig {

  @Bean
  public RedisConnectionFactory redisConnectionFactory() {
    RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
    redisStandaloneConfiguration.setHostName("localhost");
    redisStandaloneConfiguration.setPort(6379);
    redisStandaloneConfiguration.setUsername("default");
    redisStandaloneConfiguration.setPassword("Admin@1234");
    return new LettuceConnectionFactory(redisStandaloneConfiguration);
  }

  @Bean
  public RedisCacheConfiguration cacheConfiguration() {
    return RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(60))
        .disableCachingNullValues()
        .serializeValuesWith(
            SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
  }

  @Bean
  public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
    var jacksonSerializer = new GenericJackson2JsonRedisSerializer();
    return (builder) ->
        builder
            .withCacheConfiguration(
                "bins",
                RedisCacheConfiguration.defaultCacheConfig()
                    .serializeValuesWith(SerializationPair.fromSerializer(jacksonSerializer))
                    .entryTtl(Duration.ofSeconds(10)))
            .withCacheConfiguration(
                "drives",
                RedisCacheConfiguration.defaultCacheConfig()
                    .serializeValuesWith(SerializationPair.fromSerializer(jacksonSerializer))
                    .entryTtl(Duration.ofMinutes(15)));
  }

  @Bean
  RedisCacheManager cacheManager(
      RedisConnectionFactory redisConnectionFactory, RedisCacheConfiguration cacheConfiguration) {

    return RedisCacheManager.builder(redisConnectionFactory)
        .cacheDefaults(cacheConfiguration)
        .transactionAware()
        .build();
  }

  /*@Bean
  public ObjectMapper objectMapper() {
      return JsonMapper.builder()
              .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS, true)
              .configure(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE, false)
              .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
              .configure(DeserializationFeature.READ_ENUMS_USING_TO_STRING, true)
              .addModule(new JavaTimeModule())
              .findAndAddModules()
              .build();
  }*/

  /*@Bean
  public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
      var jacksonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper());

      var valueSerializer = RedisSerializationContext.SerializationPair.fromSerializer(jacksonSerializer);
      return (builder) -> builder
    		  .withCacheConfiguration("bins",RedisCacheConfiguration.defaultCacheConfig()
    				  .serializeValuesWith(valueSerializer)
    				  .entryTtl(Duration.ofMinutes(10)))
              .withCacheConfiguration("drives",
                      RedisCacheConfiguration.defaultCacheConfig()
                              .serializeValuesWith(valueSerializer)
                              .entryTtl(Duration.ofMinutes(15)));

  }*/
}
