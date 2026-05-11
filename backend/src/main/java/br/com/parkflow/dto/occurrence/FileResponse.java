package br.com.parkflow.dto.occurrence;

import java.util.UUID;

public record FileResponse(
    UUID id,
    String url,
    String publicId,
    String originalFilename,
    String contentType,
    Long sizeBytes
) {
}

