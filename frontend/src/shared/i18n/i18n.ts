import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const languageStorageKey = "diy-shop-language";
const supportedLanguages = ["vi", "en"] as const;

const resources = {
  vi: {
    translation: {
      navigation: { shop: "Cửa hàng" },
      language: { vi: "Tiếng Việt", en: "English" },
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
      navigation: { shop: "Shop" },
      language: { vi: "Tiếng Việt", en: "English" },
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
