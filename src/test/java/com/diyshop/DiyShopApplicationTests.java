package com.diyshop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "shop.seller.username=test-seller",
        "shop.seller.password-hash=$2a$10$J2sAmCYBQkK90yrzGQlxpODShROoEpBYck9m4jsLQIa0sut.uihTy",
        "shop.bank-transfer.bank-name=Test Bank",
        "shop.bank-transfer.bank-code=testbank",
        "shop.bank-transfer.bank-bin=970000",
        "shop.bank-transfer.account-number=123456789",
        "shop.bank-transfer.account-name=DIY SHOP"
})
class DiyShopApplicationTests {

	@Test
	void contextLoads() {
	}

}
