package com.diyshop.product.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

import java.nio.file.Path;

@ConfigurationProperties(prefix = "shop.image-storage")
public class ProductImageStorageProperties {

    private String provider = "local";
    private Path localDirectory = Path.of("./uploads/product-images");
    private DataSize maxFileSize = DataSize.ofMegabytes(5);
    private final S3 s3 = new S3();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Path getLocalDirectory() {
        return localDirectory;
    }

    public void setLocalDirectory(Path localDirectory) {
        this.localDirectory = localDirectory;
    }

    public DataSize getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(DataSize maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public S3 getS3() {
        return s3;
    }

    public static class S3 {
        private String bucket;
        private String region = "ap-southeast-1";
        private long presignedUrlDurationMinutes = 60;

        public String getBucket() {
            return bucket;
        }

        public void setBucket(String bucket) {
            this.bucket = bucket;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }

        public long getPresignedUrlDurationMinutes() {
            return presignedUrlDurationMinutes;
        }

        public void setPresignedUrlDurationMinutes(long presignedUrlDurationMinutes) {
            this.presignedUrlDurationMinutes = presignedUrlDurationMinutes;
        }
    }
}
