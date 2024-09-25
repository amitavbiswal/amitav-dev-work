/** AttachmentController.java */
package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.AttachmentService;
import com.amitav.reactiveapp.dto.AttachmentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@RestController
@RequestMapping("/api/v1/reactiveapp/attachment")
@RequiredArgsConstructor
public class AttachmentController {

  private final AttachmentService attachmentService;

  @PostMapping
  public Mono<ResponseEntity<AttachmentDTO>> upload(
      @RequestPart("file") Mono<FilePart> filePartMono) {
    return attachmentService.upload(filePartMono);
  }

  @GetMapping("/{attachmentId}")
  public Mono<ResponseEntity<Flux<DataBuffer>>> download(
      @PathVariable("attachmentId") String attachmentId) {
    return attachmentService.download(attachmentId);
  }
}
