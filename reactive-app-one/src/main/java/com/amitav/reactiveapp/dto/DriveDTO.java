/** DriveDto.java */
package com.amitav.reactiveapp.dto;

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

  private String serialNo;

  private String manufacturer;

  private LocalDateTime creationDate;

  private LocalDateTime modifiedDate;

  private BinDTO binDTO;
}
