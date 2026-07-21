package com.diyshop.banktransfer;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "shop.bank-transfer")
public class BankTransferProperties {

    @NotBlank
    @Size(max = 100)
    private String bankName;

    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9_-]+")
    private String bankCode;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String bankBin;

    @NotBlank
    @Pattern(regexp = "\\d{6,19}")
    private String accountNumber;

    @NotBlank
    @Size(max = 100)
    private String accountName;

    @NotNull
    private VietQrTemplate template = VietQrTemplate.COMPACT;

    @Min(1)
    @Max(168)
    private long paymentDueHours = 24;

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public String getBankBin() {
        return bankBin;
    }

    public void setBankBin(String bankBin) {
        this.bankBin = bankBin;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public VietQrTemplate getTemplate() {
        return template;
    }

    public void setTemplate(VietQrTemplate template) {
        this.template = template;
    }

    public long getPaymentDueHours() {
        return paymentDueHours;
    }

    public void setPaymentDueHours(long paymentDueHours) {
        this.paymentDueHours = paymentDueHours;
    }
}
