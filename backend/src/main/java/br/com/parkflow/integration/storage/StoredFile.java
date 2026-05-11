package br.com.parkflow.integration.storage;

public record StoredFile(
    String url,
    String publicId,
    String originalFilename,
    String contentType,
    Long sizeBytes
) {
}

