/** AttachmentService.java */
package com.amitav.reactiveapp.delegate;

import com.amitav.reactiveapp.dto.AttachmentDTO;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
public interface AttachmentService {

  /**
   * @param filePartMono
   */
  Mono<ResponseEntity<AttachmentDTO>> upload(Mono<FilePart> filePartMono);

  /**
   * @param attachmentId
   * @return
   */
  Mono<ResponseEntity<Flux<DataBuffer>>> download(String attachmentId);
}
