package com.amitav.reactiveapp.api;

import com.amitav.reactiveapp.delegate.BinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/v1/reactiveapp")
@Slf4j
@RequiredArgsConstructor
public class BinApiController implements IBinController {

  private final BinService binService;

  @Override
  public BinService getDelegate() {
    log.info("BinApiController:getDelegate--------------------------->>");
    return this.binService;
  }
}
