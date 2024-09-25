/** AttachmentServiceImpl.java */
package com.amitav.reactiveapp.delegate;

import com.amitav.reactiveapp.dto.AttachmentDTO;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author amitav.biswal
 */
@Service
@Slf4j
public class AttachmentServiceImpl implements AttachmentService {

  private final Path basePath =
      Paths.get("/Users/amitav.biswal/reactive-app/src/main/resources/attachments/");

  @Override
  public Mono<ResponseEntity<AttachmentDTO>> upload(Mono<FilePart> filePartMono) {
    String uuid = UUID.randomUUID().toString();
    return filePartMono
        .doOnNext(fp -> log.info("Receiving File:" + fp.filename()))
        .flatMap(fp -> fp.transferTo(basePath.resolve(uuid + "_" + fp.filename())))
        .then(
            Mono.just(
                new ResponseEntity<>(
                    AttachmentDTO.builder().attchmentId(uuid).filePath(basePath.toString()).build(),
                    HttpStatus.OK)));
  }

  @Override
  public Mono<ResponseEntity<Flux<DataBuffer>>> download(String attachmentId) {
    log.info("AttachmentServiceImpl:download-----------------------------------S");
    UrlResource resource = null;
    String filename = "";

    try (Stream<Path> stream = Files.list(basePath)) {

      Optional<Path> filePathOptional =
          stream
              .filter(f -> !Files.isDirectory(f))
              .map(e -> e.toString())
              // .filter(e -> e.contains(attachmentId))
              .filter(e -> e.substring(e.lastIndexOf(File.separator) + 1).startsWith(attachmentId))
              .map(e -> Paths.get(e))
              .findFirst();
      Path filePath = filePathOptional.isPresent() ? filePathOptional.get() : null;
      filename = filePath.getFileName().toString();
      resource = new UrlResource(filePath.toUri());

    } catch (MalformedURLException mue) {
      log.error("MalformedURLException :: ", mue);
    } catch (IOException ie) {
      log.error("IOException :: ", ie);
    }

    Flux<DataBuffer> dataBufferFlux =
        DataBufferUtils.read(resource, new DefaultDataBufferFactory(), 10240);
    log.info("AttachmentServiceImpl:download-----------------------------------E");
    return Mono.just(
        ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(dataBufferFlux));
  }
}
