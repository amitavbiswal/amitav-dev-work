/** CacheController.java */
package com.amitav.reactiveapp.api;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/reactiveapp/cache")
public class CacheController {

  private final CacheManager cacheManager;

  @PostMapping("/clearall")
  public Mono<ResponseEntity<Void>> clearCache(@RequestBody List<String> cacheNames) {
    cacheNames.stream().forEach(cacheName -> cacheManager.getCache(cacheName).clear());
    return Mono.just(new ResponseEntity<>(HttpStatus.OK));
  }

  @PostMapping("/clearspecific")
  public Mono<ResponseEntity<Void>> evictSpecificCacheKey(
      @RequestBody Map<String, List<String>> cacheMapKeyVal) {
    log.info("CacheController.evictSpecificCacheKey---------------------------------------------S");
    cacheMapKeyVal.forEach(
        (cacheName, listCacheKey) -> {
          listCacheKey.stream()
              .forEach(
                  cacheKey -> {
                    log.info("Key = {}  | value = {}", cacheName, cacheKey);
                    cacheManager.getCache(cacheName).evict(cacheKey);
                  });
        });

    log.info("CacheController.evictSpecificCacheKey---------------------------------------------E");
    return Mono.just(new ResponseEntity<>(HttpStatus.OK));
  }
}
