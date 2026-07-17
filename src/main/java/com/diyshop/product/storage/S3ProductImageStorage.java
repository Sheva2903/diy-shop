package com.diyshop.product.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "shop.image-storage.provider", havingValue = "s3")
public class S3ProductImageStorage implements ProductImageStorage {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final Duration presignedUrlDuration;

    public S3ProductImageStorage(
            S3Client s3Client,
            S3Presigner s3Presigner,
            ProductImageStorageProperties properties
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = properties.getS3().getBucket();
        this.presignedUrlDuration = Duration.ofMinutes(properties.getS3().getPresignedUrlDurationMinutes());
    }

    @Override
    public StoredProductImage store(
            InputStream content,
            long contentLength,
            String contentType,
            String fileExtension
    ) {
        String storageKey = "products/" + UUID.randomUUID() + "." + fileExtension;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(content, contentLength));
            return new StoredProductImage(storageKey, contentType);
        } catch (RuntimeException exception) {
            throw new ProductImageStorageException("Could not store product image in S3", exception);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .build());
        } catch (RuntimeException exception) {
            throw new ProductImageStorageException("Could not delete product image from S3", exception);
        }
    }

    @Override
    public String getDisplayUrl(String storageKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(storageKey)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(presignedUrlDuration)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
}
