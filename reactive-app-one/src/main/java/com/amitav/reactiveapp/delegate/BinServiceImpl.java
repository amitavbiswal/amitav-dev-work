/** BinApiDelegateImpl.java */
package com.amitav.reactiveapp.delegate;

import static com.amitav.reactiveapp.utils.DateUtil.*;

import com.amitav.reactiveapp.dto.BinDTO;
import com.amitav.reactiveapp.entity.BinEntity;
import com.amitav.reactiveapp.repo.BinRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BinServiceImpl implements BinService {

  private final BinRepository binRepository;

  private final BinHelperV1 binHelperV1;

  private final BinHelperV2 binHelperV2;

  private final CommonHelper commonHelper;

  @Override
  public Mono<ResponseEntity<BinDTO>> createBin(BinDTO binDTO, ServerWebExchange exchange) {
    log.info("BinServiceImpl.createBin-------------------------------------S");

    Mono<BinEntity> monoBinEntity =
        binRepository.save(
            BinEntity.builder()
                .binId(binDTO.getBinId())
                .binName(binDTO.getBinName())
                .binType(binDTO.getBinType())
                .modifiedDate(currentTimeInUtc())
                .build());

    Mono<ResponseEntity<BinDTO>> monoResponse =
        monoBinEntity
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build())
            .map(value -> ResponseEntity.status(HttpStatus.CREATED).body(value));

    /*Mono<ResponseEntity<BinDTO>> monoResponse =
          binRepository
              .save(
                  BinEntity.builder()
                      .binId(binDTO.getBinId())
                      .binName(binDTO.getBinName())
                      .binType(binDTO.getBinType())
                      .modifiedDate(currentTimeInUtc())
                      .build())
              .map(
                  binEntity ->
                      BinDTO.builder()
                          .binId(binEntity.getBinId())
                          .binName(binEntity.getBinName())
                          .binType(binEntity.getBinType())
                          .modifiedDate(binEntity.getModifiedDate())
                          .build())
              .map(value -> ResponseEntity.status(HttpStatus.CREATED).body(value));
    */
    log.info("BinServiceImpl.createBin-------------------------------------E");
    return monoResponse;
  }

  @CachePut(value = "bins", key = "#binId")
  @Override
  public Mono<BinDTO> updateBin(BinDTO binDTO, Long binId) {
    log.info("BinApiDelegateImpl.updateBin-------------------------------------S");
    return binRepository
        .findById(binId)
        .flatMap(
            binEntity -> {
              binEntity.setBinType(binDTO.getBinType());
              return this.binRepository.save(binEntity);
            })
        .map(
            updatedBinEntity ->
                BinDTO.builder()
                    .binId(updatedBinEntity.getBinId())
                    .binName(updatedBinEntity.getBinName())
                    .binType(updatedBinEntity.getBinType())
                    .modifiedDate(updatedBinEntity.getModifiedDate())
                    .build());
  }

  @Cacheable(value = "bins", key = "#binId")
  @Override
  public Mono<BinDTO> fetchBin(Long binId, ServerWebExchange exchange) {
    log.info("BinApiDelegateImpl.fetchBin-------------------------------------S");

    Mono<BinEntity> monoBinEntity = binRepository.findById(binId).cache();

    log.info("BinApiDelegateImpl.fetchBin-------------------------------------S");
    return monoBinEntity.map(
        binEntity ->
            BinDTO.builder()
                .binId(binEntity.getBinId())
                .binName(binEntity.getBinName())
                .binType(binEntity.getBinType())
                .modifiedDate(binEntity.getModifiedDate())
                .build());
  }

  @Override
  public Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinName(
      List<String> binNames, ServerWebExchange exchange) {
    log.info("BinApiDelegateImpl.fetchBinByBinName-------------------------------------S");

    Flux<BinDTO> fluxBinDTO =
        binRepository
            .findByBinNameIn(binNames)
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build());

    List<String> listBinName = Arrays.asList("BIN-B1", "BIN-B2", "BIN-B3");
    Collections.shuffle(listBinName);

    // Call other service with circuit breaker
    Flux<BinDTO> additionalFluxBinDTO = binHelperV1.getBinByBinName(listBinName);

    // Call other service without circuit breaker
    // Flux<BinDTO> additionalFluxBinDTO = binHelperV2.getBinByBinName(listBinName);

    Flux<BinDTO> mergedFluxBinDTO = Flux.merge(fluxBinDTO, additionalFluxBinDTO);

    log.info("BinApiDelegateImpl.fetchBinByBinName-------------------------------------E");
    return Mono.just(new ResponseEntity<>(mergedFluxBinDTO, HttpStatus.OK));
  }

  @Override
  public Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinNames(
      List<String> binNames, ServerWebExchange exchange) {
    log.info("BinApiDelegateImpl.fetchBinByBinNames-------------------------------------S");
    Flux<BinDTO> fluxBinDTO =
        binRepository
            .findByBinNameIn(binNames)
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build());

    log.info("BinApiDelegateImpl.fetchBinByBinNames-------------------------------------E");
    return Mono.just(new ResponseEntity<>(fluxBinDTO, HttpStatus.OK));
  }

  @Override
  public Mono<ResponseEntity<Flux<BinDTO>>> fetchBinsByFilter(
      String binName, String binType, ServerWebExchange exchange) {
    log.info("BinApiDelegateImpl.fetchBinsByFilter-------------------------------------S");

    Flux<BinDTO> fluxBinDTO =
        binRepository
            .findByBinNameAndBinType(binName, binType)
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build());
    log.info("BinApiDelegateImpl.fetchBinsByFilter-------------------------------------E");
    return Mono.just(new ResponseEntity<>(fluxBinDTO, HttpStatus.OK));
  }

  @Override
  public Mono<ResponseEntity<Flux<BinDTO>>> fetchAllBins() {
    log.info("BinApiDelegateImpl.fetchAllBins---------------------------------S");
    log.info("BinApiDelegateImpl.fetchAllBins.threadName =>" + Thread.currentThread().getName());
    Flux<BinDTO> fluxBinDTO =
        binRepository
            .findAll()
            .map(
                binEntity ->
                    BinDTO.builder()
                        .binId(binEntity.getBinId())
                        .binName(binEntity.getBinName())
                        .binType(binEntity.getBinType())
                        .modifiedDate(binEntity.getModifiedDate())
                        .build());
    commonHelper.sendEmail();
    log.info("BinApiDelegateImpl.fetchAllBins---------------------------------E");
    return Mono.just(new ResponseEntity<>(fluxBinDTO, HttpStatus.OK));
  }
}
