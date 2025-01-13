/** DriveDto.java */
package com.amitav.reactiveapp.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * @author amitav.biswal
 */
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class DriveDTO {

  private Long driveId;

  @Size(min = 3, max = 10)
  private String serialNo;

  @Size(min = 3, max = 6)
  private String manufacturer;

  private LocalDateTime creationDate;

  private LocalDateTime modifiedDate;
}
