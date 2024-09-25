package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.BinService;
import com.amitav.reactiveapp.dto.BinDTO;
import com.amitav.reactiveapp.dto.ErrorDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Validated
@Controller
@Tag(name = "bin", description = "the bin API")
public interface IBinController {

  /**
   * @return
   */
  BinService getDelegate();

  /**
   * POST /bin : create a new bin
   *
   * @param binDTO (optional)
   * @return OK (status code 200) or unexpected error (status code 200)
   */
  @Operation(
      operationId = "createBin",
      summary = "create a new bin",
      tags = {"bin"},
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = BinDTO.class))
            }),
        @ApiResponse(
            responseCode = "default",
            description = "unexpected error",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = ErrorDTO.class))
            })
      })
  // @Secured({"ROLE_DOORADMIN"})
  @PreAuthorize("hasRole('ROLE_DOORADMIN')")
  @RequestMapping(
      method = RequestMethod.POST,
      value = "/bin",
      produces = {"application/json"},
      consumes = {"application/json"})
  default Mono<ResponseEntity<BinDTO>> createBin(
      @Parameter(name = "BinDTO", description = "") @Valid @RequestBody(required = false)
          BinDTO binDTO,
      @Parameter(hidden = true) final ServerWebExchange exchange) {
    return getDelegate().createBin(binDTO, exchange);
  }

  /**
   * GET /bin/{binId} : fetch bin by id Uniq Id of a bin
   *
   * @param binId Id of the returned bin (required)
   * @return OK (status code 200) or unexpected error (status code 200)
   */
  @Operation(
      operationId = "fetchBin",
      summary = "fetch bin by id",
      description = "Uniq Id of a bin",
      tags = {"bin"},
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = BinDTO.class))
            }),
        @ApiResponse(
            responseCode = "default",
            description = "unexpected error",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = ErrorDTO.class))
            })
      })
  // @Secured({"ROLE_DOORUSER"})
  @PreAuthorize("hasRole('ROLE_DOORUSER')")
  @RequestMapping(
      method = RequestMethod.GET,
      value = "/bin/{binId}",
      produces = {"application/json"})
  default Mono<ResponseEntity<BinDTO>> fetchBin(
      @Parameter(
              name = "binId",
              description = "Id of the returned bin",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable("binId")
          Long binId,
      @Parameter(hidden = true) final ServerWebExchange exchange) {

    Mono<BinDTO> monoBinDTO = getDelegate().fetchBin(binId, exchange);

    return monoBinDTO
        .map(newBinDTO -> new ResponseEntity<>(newBinDTO, HttpStatus.OK))
        .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
  }

  /**
   * GET /bin/byBinName : fetch bin by filter parameters Multiple filters can be provided
   *
   * @param binName binNames to filter bin (optional)
   * @return successful operation (status code 200) or Invalid binName (status code 400) or
   *     unexpected error (status code 200)
   */
  @Operation(
      operationId = "fetchBinByBinName",
      summary = "fetch bin by filter parameters",
      description = "Multiple filters can be provided",
      tags = {"bin"},
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "successful operation",
            content = {
              @Content(
                  mediaType = "application/json",
                  array = @ArraySchema(schema = @Schema(implementation = BinDTO.class)))
            }),
        @ApiResponse(responseCode = "400", description = "Invalid binName"),
        @ApiResponse(
            responseCode = "default",
            description = "unexpected error",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = ErrorDTO.class))
            })
      })
  // @Secured({"ROLE_DOORUSER"})
  @PreAuthorize("hasRole('ROLE_DOORUSER')")
  @RequestMapping(
      method = RequestMethod.GET,
      value = "/bin/byBinName",
      produces = {"application/json"})
  default Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinName(
      @Parameter(name = "binName", description = "binNames to filter bin", in = ParameterIn.QUERY)
          @Valid
          @RequestParam(value = "binNames", required = false)
          List<String> binNames,
      @Parameter(hidden = true) final ServerWebExchange exchange) {
    return getDelegate().fetchBinByBinName(binNames, exchange);
  }

  /**
   * GET /bin/byAnyfilter : fetch bin by filter parameters Multiple filters can be provided
   *
   * @param binName binNames to filter binary (optional)
   * @param binType binType to filter binary (optional)
   * @return successful operation (status code 200) or Invalid binName or binType (status code 400)
   */
  @Operation(
      operationId = "fetchBinsByFilter",
      summary = "fetch bin by filter parameters",
      description = "Multiple filters can be provided",
      tags = {"bin"},
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "successful operation",
            content = {
              @Content(
                  mediaType = "application/json",
                  array = @ArraySchema(schema = @Schema(implementation = BinDTO.class)))
            }),
        @ApiResponse(responseCode = "400", description = "Invalid binName or binType")
      })
  @RequestMapping(
      method = RequestMethod.GET,
      value = "/bin/byAnyfilter",
      produces = {"application/json"})
  default Mono<ResponseEntity<Flux<BinDTO>>> fetchBinsByFilter(
      @Parameter(
              name = "binName",
              description = "binNames to filter binary",
              in = ParameterIn.QUERY)
          @Valid
          @RequestParam(value = "binName", required = false)
          String binName,
      @Parameter(name = "binType", description = "binType to filter binary", in = ParameterIn.QUERY)
          @Valid
          @RequestParam(value = "binType", required = false)
          String binType,
      @Parameter(hidden = true) final ServerWebExchange exchange) {
    return getDelegate().fetchBinsByFilter(binName, binType, exchange);
  }

  // @Secured({"ROLE_DOORADMIN"})
  @PreAuthorize("hasRole('ROLE_DOORADMIN')")
  @PutMapping(
      path = "/bin/{binId}",
      consumes = {"application/json"},
      produces = {"application/json"})
  default Mono<ResponseEntity<BinDTO>> updateBin(
      @Valid @RequestBody(required = false) BinDTO binDTO, @PathVariable("binId") Long binId) {

    Mono<BinDTO> monoBinDTO = getDelegate().updateBin(binDTO, binId);
    return monoBinDTO
        .map(newBinDTO -> new ResponseEntity<>(newBinDTO, HttpStatus.OK))
        .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
  }

  @RequestMapping(
      method = RequestMethod.GET,
      value = "/bin/byBinNames",
      produces = {"application/json"})
  default Mono<ResponseEntity<Flux<BinDTO>>> fetchBinByBinNames(
      @Parameter(name = "binName", description = "binNames to filter bin", in = ParameterIn.QUERY)
          @Valid
          @RequestParam(value = "binNames", required = false)
          List<String> binNames,
      @Parameter(hidden = true) final ServerWebExchange exchange) {
    return getDelegate().fetchBinByBinNames(binNames, exchange);
  }

  @GetMapping(
      path = {"/bin/all"},
      produces = {"application/json"})
  default Mono<ResponseEntity<Flux<BinDTO>>> fetchAllBins() {
    return getDelegate().fetchAllBins();
  }
}
