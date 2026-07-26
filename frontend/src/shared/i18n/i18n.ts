import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const languageStorageKey = "diy-shop-language";
const supportedLanguages = ["vi", "en"] as const;

const resources = {
  vi: {
    translation: {
      navigation: { shop: "Cửa hàng", trackOrder: "Tra cứu đơn hàng" },
      language: { vi: "Tiếng Việt", en: "English" },
      footer: {
        contact: "Liên hệ",
        followUs: "Theo dõi",
        allRightsReserved: "Tất cả quyền được bảo lưu."
      },
      catalog: {
        title: "Đồ thủ công dành cho những khoảnh khắc riêng.",
        description: "Khám phá những món đồ làm thủ công, sẵn sàng để gửi đến bạn.",
        searchLabel: "Tìm sản phẩm",
        searchPlaceholder: "Nến, móc khóa, tranh...",
        categoryLabel: "Danh mục",
        allCategories: "Tất cả danh mục",
        searchAction: "Tìm kiếm",
        results: "{{count}} sản phẩm",
        noProductsTitle: "Chưa có sản phẩm phù hợp",
        noProductsDescription: "Hãy thử tìm kiếm hoặc chọn danh mục khác.",
        unavailable: "Tạm hết hàng",
        available: "Còn {{count}} sản phẩm",
        viewProduct: "Xem sản phẩm"
      },
      product: {
        backToShop: "Quay lại cửa hàng",
        inStock: "Còn hàng",
        outOfStock: "Tạm hết hàng",
        stockDescription: "{{count}} sản phẩm sẵn sàng để đặt.",
        outOfStockDescription: "Sản phẩm này sẽ sớm trở lại.",
        imageAlt: "Hình ảnh của {{name}}"
      },
      cart: {
        add: "Thêm vào giỏ",
        quantity: "Số lượng",
        title: "Giỏ hàng",
        empty: "Giỏ hàng của bạn đang trống",
        continueShopping: "Tiếp tục mua sắm",
        orderSummary: "Tóm tắt đơn hàng",
        subtotal: "Tạm tính",
        shippingNote: "Phí vận chuyển sẽ được tính ở bước thanh toán",
        proceedToCheckout: "Tiến hành thanh toán",
        remove: "Xoá"
      },
      checkout: {
        title: "Thanh toán",
        emptyCart: "Giỏ hàng trống",
        backToCart: "Quay lại giỏ hàng",
        recipientInfo: "Thông tin nhận hàng",
        fullName: "Họ và tên",
        phoneNumber: "Số điện thoại",
        email: "Email",
        shippingAddress: "Địa chỉ giao hàng",
        provinceCity: "Tỉnh/Thành phố",
        provinceCityPlaceholder: "VD: Hà Nội",
        district: "Quận/Huyện",
        districtPlaceholder: "VD: Hoàn Kiếm",
        ward: "Phường/Xã",
        wardPlaceholder: "VD: Cửa Đông",
        streetAddress: "Địa chỉ chi tiết",
        streetAddressPlaceholder: "VD: 123 Ngõ Tứ Mạ",
        additionalInfo: "Thông tin bổ sung",
        note: "Ghi chú",
        notePlaceholder: "Ví dụ: ghi chú cho người giao hàng",
        paymentMethod: "Hình thức thanh toán",
        cod: "Thanh toán khi nhận hàng",
        bankTransfer: "Chuyển khoản ngân hàng",
        orderSummary: "Tóm tắt đơn hàng",
        shippingFee: "Phí vận chuyển",
        total: "Tổng cộng",
        placeOrder: "Đặt hàng",
        submitting: "Đang xử lý...",
        submitError: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        required: "Trường này là bắt buộc",
        maxLength: "Không được vượt quá {{max}} ký tự",
        invalidEmail: "Email không hợp lệ",
        orderConfirmed: "Đơn hàng của bạn đã được xác nhận",
        confirmationSent: "Chúng tôi đã gửi xác nhận đến email của bạn",
        orderNotFound: "Không tìm thấy đơn hàng",
        useTrackingPage: "Vui lòng sử dụng trang tra cứu để kiểm tra đơn hàng của bạn",
        goToTracking: "Đi tới trang tra cứu",
        orderCode: "Mã đơn hàng",
        orderCodeHint: "Lưu mã này để tra cứu đơn hàng sau",
        orderDetails: "Chi tiết đơn hàng",
        items: "Sản phẩm",
        bankTransferInstructions: "Hướng dẫn chuyển khoản",
        bankName: "Ngân hàng",
        accountNumber: "Số tài khoản",
        accountName: "Tên tài khoản",
        amount: "Số tiền",
        transferContent: "Nội dung chuyển",
        paymentDueAt: "Hạn thanh toán",
        codNote: "Thanh toán khi nhận hàng",
        codDescription: "Bạn sẽ thanh toán khi nhận được hàng"
      },
      orderTracking: {
        title: "Tra cứu đơn hàng",
        description: "Nhập mã đơn hàng và số điện thoại để tra cứu trạng thái đơn hàng",
        orderCode: "Mã đơn hàng",
        orderCodePlaceholder: "VD: DS20260726-ABC123",
        phoneNumber: "Số điện thoại",
        phoneNumberPlaceholder: "Số điện thoại khi đặt hàng",
        search: "Tra cứu",
        searching: "Đang tra cứu...",
        required: "Vui lòng điền đầy đủ thông tin",
        notFound: "Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn hàng và số điện thoại.",
        error: "Có lỗi xảy ra. Vui lòng thử lại.",
        recipientInfo: "Thông tin nhận hàng",
        shippingAddress: "Địa chỉ giao hàng",
        items: "Sản phẩm",
        total: "Tổng cộng",
        paymentStatusLabel: "Trạng thái thanh toán",
        paymentStatus: {
          UNPAID: "Chưa thanh toán",
          PAID: "Đã thanh toán",
          FAILED: "Thanh toán thất bại"
        },
        "paymentStatus.UNPAID": "Chưa thanh toán",
        "paymentStatus.PAID": "Đã thanh toán",
        "paymentStatus.FAILED": "Thanh toán thất bại",
        status: {
          PENDING: "Chờ xác nhận",
          CONFIRMED: "Đã xác nhận",
          SHIPPING: "Đang giao",
          DELIVERED: "Đã giao",
          CANCELLED: "Đã huỷ"
        },
        "status.PENDING": "Chờ xác nhận",
        "status.CONFIRMED": "Đã xác nhận",
        "status.SHIPPING": "Đang giao",
        "status.DELIVERED": "Đã giao",
        "status.CANCELLED": "Đã huỷ",
        bankTransferInfo: "Thông tin chuyển khoản",
        note: "Ghi chú"
      },
      state: {
        loading: "Đang tải...",
        errorTitle: "Không thể tải nội dung này",
        errorDescription: "Vui lòng thử lại sau ít phút.",
        retry: "Thử lại",
        notFoundTitle: "Không tìm thấy trang",
        notFoundDescription: "Đường dẫn này không còn khả dụng.",
        returnToShop: "Về cửa hàng"
      }
    }
  },
  en: {
    translation: {
      navigation: { shop: "Shop", trackOrder: "Track order" },
      language: { vi: "Tiếng Việt", en: "English" },
      footer: {
        contact: "Contact",
        followUs: "Follow us",
        allRightsReserved: "All rights reserved."
      },
      catalog: {
        title: "Handmade pieces for personal moments.",
        description: "Discover ready-to-ship handmade goods, made to be enjoyed and shared.",
        searchLabel: "Search products",
        searchPlaceholder: "Candle, keychain, painting...",
        categoryLabel: "Category",
        allCategories: "All categories",
        searchAction: "Search",
        results: "{{count}} products",
        noProductsTitle: "No matching products yet",
        noProductsDescription: "Try a different search or category.",
        unavailable: "Out of stock",
        available: "{{count}} available",
        viewProduct: "View product"
      },
      product: {
        backToShop: "Back to shop",
        inStock: "In stock",
        outOfStock: "Out of stock",
        stockDescription: "{{count}} items ready to order.",
        outOfStockDescription: "This product will return soon.",
        imageAlt: "Image of {{name}}"
      },
      cart: {
        add: "Add to cart",
        quantity: "Quantity",
        title: "Shopping cart",
        empty: "Your cart is empty",
        continueShopping: "Continue shopping",
        orderSummary: "Order summary",
        subtotal: "Subtotal",
        shippingNote: "Shipping fee will be calculated at checkout",
        proceedToCheckout: "Proceed to checkout",
        remove: "Remove"
      },
      checkout: {
        title: "Checkout",
        emptyCart: "Your cart is empty",
        backToCart: "Back to cart",
        recipientInfo: "Recipient information",
        fullName: "Full name",
        phoneNumber: "Phone number",
        email: "Email",
        shippingAddress: "Shipping address",
        provinceCity: "Province/City",
        provinceCityPlaceholder: "E.g., Hanoi",
        district: "District",
        districtPlaceholder: "E.g., Hoan Kiem",
        ward: "Ward",
        wardPlaceholder: "E.g., Cua Dong",
        streetAddress: "Street address",
        streetAddressPlaceholder: "E.g., 123 Ngo Tu Ma",
        additionalInfo: "Additional information",
        note: "Note",
        notePlaceholder: "E.g., delivery instructions",
        paymentMethod: "Payment method",
        cod: "Cash on delivery",
        bankTransfer: "Bank transfer",
        orderSummary: "Order summary",
        shippingFee: "Shipping fee",
        total: "Total",
        placeOrder: "Place order",
        submitting: "Processing...",
        submitError: "Could not create order. Please try again.",
        required: "This field is required",
        maxLength: "Must not exceed {{max}} characters",
        invalidEmail: "Invalid email address",
        orderConfirmed: "Your order has been confirmed",
        confirmationSent: "A confirmation has been sent to your email",
        orderNotFound: "Order not found",
        useTrackingPage: "Please use the tracking page to check your order",
        goToTracking: "Go to tracking page",
        orderCode: "Order code",
        orderCodeHint: "Save this code to track your order later",
        orderDetails: "Order details",
        items: "Items",
        bankTransferInstructions: "Bank transfer instructions",
        bankName: "Bank name",
        accountNumber: "Account number",
        accountName: "Account name",
        amount: "Amount",
        transferContent: "Transfer content",
        paymentDueAt: "Payment due",
        codNote: "Cash on delivery",
        codDescription: "You will pay when you receive the order"
      },
      orderTracking: {
        title: "Track your order",
        description: "Enter your order code and phone number to check your order status",
        orderCode: "Order code",
        orderCodePlaceholder: "E.g., DS20260726-ABC123",
        phoneNumber: "Phone number",
        phoneNumberPlaceholder: "Phone number when placing order",
        search: "Search",
        searching: "Searching...",
        required: "Please fill in all fields",
        notFound: "No matching order found. Please verify your order code and phone number.",
        error: "An error occurred. Please try again.",
        recipientInfo: "Recipient information",
        shippingAddress: "Shipping address",
        items: "Items",
        total: "Total",
        paymentStatusLabel: "Payment status",
        "paymentStatus.UNPAID": "Unpaid",
        "paymentStatus.PAID": "Paid",
        "paymentStatus.FAILED": "Failed",
        status: {
          PENDING: "Pending",
          CONFIRMED: "Confirmed",
          SHIPPING: "Shipping",
          DELIVERED: "Delivered",
          CANCELLED: "Cancelled"
        },
        "status.PENDING": "Pending",
        "status.CONFIRMED": "Confirmed",
        "status.SHIPPING": "Shipping",
        "status.DELIVERED": "Delivered",
        "status.CANCELLED": "Cancelled",
        bankTransferInfo: "Bank transfer information",
        note: "Note"
      },
      state: {
        loading: "Loading...",
        errorTitle: "This content could not load",
        errorDescription: "Please try again in a moment.",
        retry: "Try again",
        notFoundTitle: "Page not found",
        notFoundDescription: "This address is no longer available.",
        returnToShop: "Return to shop"
      }
    }
  }
};

const storedLanguage = localStorage.getItem(languageStorageKey);
const browserLanguage = navigator.language.split("-")[0];
const initialLanguage = selectInitialLanguage(storedLanguage, browserLanguage);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "vi",
  interpolation: { escapeValue: false }
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem(languageStorageKey, language);
  document.documentElement.lang = language;
});

export default i18n;

function selectInitialLanguage(stored: string | null, browser: string): string {
  if (stored && isSupportedLanguage(stored)) {
    return stored;
  }

  return isSupportedLanguage(browser) ? browser : "vi";
}

function isSupportedLanguage(language: string): language is (typeof supportedLanguages)[number] {
  return supportedLanguages.includes(language as (typeof supportedLanguages)[number]);
}
