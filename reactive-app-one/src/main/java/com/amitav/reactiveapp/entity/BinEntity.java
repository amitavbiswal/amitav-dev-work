/** BinEntity.java */
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
@Table("BIN")
public class BinEntity {

  @Id
  @Column("BIN_ID")
  private Long binId;

  @Column("BIN_NAME")
  private String binName;

  @Column("BIN_TYPE")
  private String binType;

  @LastModifiedDate
  @Column("MODIFIED_DATE")
  private LocalDateTime modifiedDate;
}
