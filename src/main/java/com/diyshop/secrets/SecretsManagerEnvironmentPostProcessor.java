package com.diyshop.secrets;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import java.util.HashMap;
import java.util.Map;

public class SecretsManagerEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String ENABLED_FLAG = "AWS_SECRETS_MANAGER_ENABLED";
    private static final String RDS_SECRET_ID = "diyshop-rds";
    private static final String SELLER_SECRET_ID = "diyshop-seller";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String flag = System.getenv(ENABLED_FLAG);
        System.out.println("[SecretsManagerPostProcessor] " + ENABLED_FLAG + " = " + flag);

        if (!"true".equalsIgnoreCase(flag)) {
            System.out.println("[SecretsManagerPostProcessor] disabled, skipping");
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> props = new HashMap<>();
        Region region = Region.of(System.getenv().getOrDefault("AWS_REGION", "ap-southeast-2"));

        try (SecretsManagerClient client = SecretsManagerClient.builder()
                .region(region)
                .build()) {

            Map<String, String> rdsSecret = mapper.readValue(fetchSecret(client, RDS_SECRET_ID), Map.class);
            props.put("DB_USERNAME", rdsSecret.get("username"));
            props.put("DB_PASSWORD", rdsSecret.get("password"));
            System.out.println("[SecretsManagerPostProcessor] loaded DB_USERNAME=" + rdsSecret.get("username"));

            Map<String, String> sellerSecret = mapper.readValue(fetchSecret(client, SELLER_SECRET_ID), Map.class);
            props.put("DIY_SHOP_SELLER_USERNAME", sellerSecret.get("DIY_SHOP_SELLER_USERNAME"));
            props.put("DIY_SHOP_SELLER_PASSWORD_HASH", sellerSecret.get("DIY_SHOP_SELLER_PASSWORD_HASH"));
            System.out.println("[SecretsManagerPostProcessor] loaded seller secret OK");

        } catch (Exception e) {
            System.err.println("[SecretsManagerPostProcessor] FAILED: " + e);
            e.printStackTrace();
            throw new IllegalStateException("Failed to load secrets from Secrets Manager", e);
        }

        environment.getPropertySources().addFirst(new MapPropertySource("secretsManager", props));
        System.out.println("[SecretsManagerPostProcessor] property source added successfully");
    }

    private String fetchSecret(SecretsManagerClient client, String secretId) {
        return client.getSecretValue(GetSecretValueRequest.builder().secretId(secretId).build())
                .secretString();
    }
}
