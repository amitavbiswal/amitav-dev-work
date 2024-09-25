/** AttachmentResponseDTO.java */
package com.amitav.reactiveapp.dto;

import lombok.Builder;
import lombok.Data;

/**
 * @author amitav.biswal
 */
@Data
@Builder
public class AttachmentDTO {

  private String attchmentId;

  private String filePath;
}
