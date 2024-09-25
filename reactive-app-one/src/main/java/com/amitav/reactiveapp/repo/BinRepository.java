/** BinRepo.java */
package com.amitav.reactiveapp.repo;

import com.amitav.reactiveapp.entity.BinEntity;
import java.util.List;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import reactor.core.publisher.Flux;

/**
 * @author amitav.biswal
 */
public interface BinRepository extends R2dbcRepository<BinEntity, Long> {

  Flux<BinEntity> findByBinNameIn(List<String> binName);

  Flux<BinEntity> findByBinNameAndBinType(String binName, String binType);

  @Query("select * from BIN b where b.BIN_NAME = :binName and b.BIN_TYPE = :binType")
  Flux<BinEntity> findByCustomFilter(
      @Param("binName") String binName, @Param("binType") String binType);
}
