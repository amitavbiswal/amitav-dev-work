/** BinApiControllerTest.java */
package com.amitav.reactiveapp.api;

import static org.mockito.Mockito.*;

import com.amitav.reactiveapp.delegate.BinService;
import com.amitav.reactiveapp.delegate.CommonHelper;
import com.amitav.reactiveapp.dto.BinDTO;
import com.amitav.reactiveapp.entity.BinEntity;
import com.amitav.reactiveapp.repo.BinRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.ResponseSpec;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@WebFluxTest(controllers = {IBinController.class, BinService.class, CommonHelper.class})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class BinApiControllerTest {

  @Autowired private WebTestClient webTestClient;

  @MockBean private BinRepository binRepository;

  @MockBean private WebClient.Builder builder;

  @Order(2)
  @Test
  void createBinTest_01() {

    BinDTO inputBinDTO = BinDTO.builder().binName("bin-a").binType("aaa").build();

    BinEntity inputBinEntity =
        BinEntity.builder()
            .binId(1L)
            .binName("bin-a")
            .binType("aaa")
            .modifiedDate(currentTimeInUtc())
            .build();

    when(binRepository.save(any())).thenReturn(Mono.just(inputBinEntity));

    ResponseSpec responseSpec =
        webTestClient
            .post()
            .uri("/api/v1/reactiveapp/bin")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(inputBinDTO)
            .exchange();

    responseSpec.expectStatus().is2xxSuccessful();

    responseSpec
        .expectBody()
        // .consumeWith(System.out::println)
        .jsonPath("$.binId")
        .isEqualTo("1")
        .jsonPath("$.binName")
        .isEqualTo("bin-a")
        .jsonPath("$.binType")
        .isEqualTo("aaa");
  }

  @Order(1)
  @Test
  void createBinTest_02() {
    LocalDateTime localDateTime = currentTimeInUtc();
    BinDTO inputBinDTO =
        BinDTO.builder()
            .binId(1L)
            .binName("bin-a")
            .binType("bbb")
            .modifiedDate(localDateTime)
            .build();

    BinEntity binEntity1 =
        BinEntity.builder()
            .binId(1L)
            .binName("bin-a")
            .binType("aaa")
            .modifiedDate(localDateTime)
            .build();

    BinEntity binEntity2 =
        BinEntity.builder()
            .binId(1L)
            .binName("bin-a")
            .binType("bbb")
            .modifiedDate(localDateTime)
            .build();

    when(binRepository.findById(1L)).thenReturn(Mono.just(binEntity1));
    when(binRepository.save(binEntity2)).thenReturn(Mono.just(binEntity2));

    ResponseSpec responseSpec =
        webTestClient
            .put()
            .uri("/api/v1/reactiveapp/bin/{binId}", 1)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(inputBinDTO)
            .exchange();

    responseSpec.expectStatus().isOk();
    responseSpec
        .expectBody()
        // .consumeWith(System.out::println)
        .jsonPath("$.binId")
        .isEqualTo("1")
        .jsonPath("$.binName")
        .isEqualTo("bin-a")
        .jsonPath("$.binType")
        .isEqualTo("bbb");
  }

  private LocalDateTime currentTimeInUtc() {
    return LocalDateTime.now()
        .atZone(ZoneId.systemDefault())
        .withZoneSameInstant(ZoneOffset.UTC)
        .toLocalDateTime();
  }
}
