package com.diyshop.banktransfer;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(BankTransferProperties.class)
class BankTransferConfiguration {
}
