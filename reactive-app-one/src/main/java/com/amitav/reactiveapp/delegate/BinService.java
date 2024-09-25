package com.amitav.reactiveapp.delegate;

import com.amitav.reactiveapp.dto.BinDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface BinService {

  Mono<ResponseEntity<BinDTO>> createBin(BinDTO binDTO, ServerWebExchange exchange);

  Mono<BinDTO> fetchBin(Long binId, ServerWebExchange exchange);

  Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinName(
      List<String> binName, ServerWebExchange exchange);

  Mono<ResponseEntity<Flux<BinDTO>>> fetchBinsByFilter(
      String binName, String binType, ServerWebExchange exchange);

  /**
   * @param binDTO
   * @param binId
   * @param exchange
   * @return
   */
  Mono<BinDTO> updateBin(BinDTO binDTO, Long binId);

  /**
   * @param binNames
   * @param exchange
   * @return
   */
  Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinNames(
      List<String> binNames, ServerWebExchange exchange);

  /**
   * @return
   */
  Mono<ResponseEntity<Flux<BinDTO>>> fetchAllBins();
}
