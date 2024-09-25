package com.amitav.reactiveapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.format.annotation.DateTimeFormat;

/** Data elements for Bin */
@Schema(name = "BinDTO", description = "Data elements for Bin")
@Builder
@Getter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class BinDTO implements Serializable {

  private static final long serialVersionUID = 1L;

  private Long binId;

  @Size(min = 3, max = 10)
  @Schema(name = "binName", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("binName")
  private String binName;

  @Size(min = 3, max = 5)
  @Schema(name = "binType", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("binType")
  private String binType;

  @JsonDeserialize(using = LocalDateTimeDeserializer.class)
  @JsonSerialize(using = LocalDateTimeSerializer.class)
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  @JsonProperty("modifiedDate")
  @Valid
  @Schema(name = "modifiedDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  private LocalDateTime modifiedDate;

  @Schema(name = "binId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("binId")
  public Long getBinId() {
    return binId;
  }
}
