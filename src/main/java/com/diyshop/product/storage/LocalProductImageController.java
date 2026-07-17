package com.diyshop.product.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/media/product-images")
@ConditionalOnProperty(name = "shop.image-storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalProductImageController {

    private final LocalProductImageStorage storage;

    public LocalProductImageController(LocalProductImageStorage storage) {
        this.storage = storage;
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        Resource resource = storage.load(filename);
        String contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE,
                        contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .body(resource);
    }
}
