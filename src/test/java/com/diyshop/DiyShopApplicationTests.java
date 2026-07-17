package com.diyshop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "shop.seller.username=test-seller",
        "shop.seller.password-hash=$2a$10$J2sAmCYBQkK90yrzGQlxpODShROoEpBYck9m4jsLQIa0sut.uihTy"
})
class DiyShopApplicationTests {

	@Test
	void contextLoads() {
	}

}
