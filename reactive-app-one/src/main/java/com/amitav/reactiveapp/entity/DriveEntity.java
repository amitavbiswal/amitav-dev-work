/** DriveEntity.java */
package com.amitav.reactiveapp.entity;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * @author amitav.biswal
 */
@Builder
@Data
@Table("DRIVE")
public class DriveEntity {

  @Id
  @Column("DRIVE_ID")
  private Long driveId;

  @Column("SR_NO")
  private String serialNo;

  @Column("MANUFACTURER")
  private String manufacturer;

  private LocalDateTime creationDate;

  @LastModifiedDate private LocalDateTime modifiedDate;
}
