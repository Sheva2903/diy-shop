package com.diyshop.product.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(ProductImageStorageProperties.class)
public class ProductImageStorageConfiguration {

    @Bean
    @ConditionalOnProperty(name = "shop.image-storage.provider", havingValue = "s3")
    S3Client s3Client(ProductImageStorageProperties properties) {
        validateS3Properties(properties);
        return S3Client.builder()
                .region(Region.of(properties.getS3().getRegion()))
                .build();
    }

    @Bean
    @ConditionalOnProperty(name = "shop.image-storage.provider", havingValue = "s3")
    S3Presigner s3Presigner(ProductImageStorageProperties properties) {
        validateS3Properties(properties);
        return S3Presigner.builder()
                .region(Region.of(properties.getS3().getRegion()))
                .build();
    }

    private void validateS3Properties(ProductImageStorageProperties properties) {
        if (!StringUtils.hasText(properties.getS3().getBucket())) {
            throw new IllegalStateException("IMAGE_STORAGE_S3_BUCKET is required when image storage provider is s3");
        }
    }
}
